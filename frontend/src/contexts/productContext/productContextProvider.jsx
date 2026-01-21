import { useCallback, useContext, useEffect, useRef, useState } from "react";
import productContext from "./createProductContext";
import PropTypes from "prop-types";
import fetchDataForm, { API_BASE } from "../../api";
import { toast } from "react-toastify";
import debounce from "just-debounce-it";
import authContext from "../loginContext/createAuthContext";

const ProductProvider = ({ children }) => {
  const { user, authFetch, initialized, getCsrfToken } =
    useContext(authContext);

  const stockRefreshed = useRef(false);

  const [dataForm, setDataForm] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [total, setTotal] = useState(null);
  const [limit, setLimit] = useState(10);

  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart") || "[]";
      return JSON.parse(raw);
    } catch {
      return [];
    }
  });
  const [value, setValue] = useState(0);
  const [productId, setProductId] = useState("");

  const [oldProducts, setOldProducts] = useState([]);
  const [isLoadingOld, setIsLoadingOld] = useState(true);
  const [oldPage, setOldPage] = useState(1);
  const [oldTotalPages, setOldTotalPages] = useState(1);
  const [oldLimit] = useState(10);

  const listControllerRef = useRef(null);
  const oldControllerRef = useRef(null);

  const doFetch = useCallback(
    (url, options = {}) => {
      if (user && authFetch) return authFetch(url, options);
      return fetch(url, { ...options, credentials: "include" });
    },
    [user, authFetch]
  );

  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  //-----------------------------------

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart || []));
    } catch (err) {
      console.error("Error saving cart to localStorage", err);
    }
  }, [cart]);

  const syncingRef = useRef(false);
  const replaceOnServer = useCallback(
    async (items) => {
      if (syncingRef.current) {
        return;
      }
      syncingRef.current = true;

      try {
        if (!user || !authFetch) {
          localStorage.setItem("cart", JSON.stringify(items || []));
          return;
        }

        let csrf = null;
        try {
          if (typeof getCsrfToken === "function") {
            csrf = await getCsrfToken();
          }
        } catch (err) {
          console.warn("replaceOnServer -> getCsrfToken failed:", err);
        }

        const res = await authFetch(`${API_BASE}/cart/replace`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(csrf ? { "X-CSRF-Token": csrf } : {}),
          },
          body: JSON.stringify({
            items: items.map((it) => ({
              product_id: it.product_id,
              quantity: it.quantity,
            })),
          }),
        });

        if (!res.ok) {
          localStorage.setItem("cart", JSON.stringify(items || []));
          return;
        }

        let server = null;
        try {
          server = await res.json();
        } catch (err) {
          console.warn("replaceOnServer -> response not JSON:", err);
        }

        if (server?.items && Array.isArray(server.items)) {
          if (items.length <= server.items.length) {
            if (
              JSON.stringify(server.items) !== JSON.stringify(cartRef.current)
            ) {
              setCart(server.items);
              cartRef.current = server.items;
              localStorage.setItem("cart", JSON.stringify(server.items));
            }
          }
        }
      } catch (err) {
        console.error("replaceOnServer error:", err);
        localStorage.setItem("cart", JSON.stringify(items || []));
      } finally {
        syncingRef.current = false;
      }
    },
    [authFetch, getCsrfToken, user]
  );

  const debouncedReplace = useRef(
    debounce((items) => replaceOnServer(items), 300)
  ).current;

  const refreshCartStock = useCallback(
    async (currentCart) => {
      if (!currentCart || currentCart.length === 0) return;

      const needsUpdate = currentCart.some((item) => item.stock === undefined);

      if (needsUpdate || !user) {
        try {
          const updatedItems = await Promise.all(
            currentCart.map(async (item) => {
              try {
                const res = await fetch(
                  `${API_BASE}/dashboard/${item.product_id}`
                );

                if (res.ok) {
                  const data = await res.json();

                  if (!data || !data.product_id) return null;

                  return {
                    ...item,
                    stock: Number(data.quantity),
                    price: data.price,
                    name: data.name,
                    image: data.image,
                    quantity: Math.min(item.quantity, Number(data.quantity)),
                  };
                }
              } catch {
                return null;
              }
            })
          );

          const validItems = updatedItems.filter((item) => item !== null);

          if (JSON.stringify(validItems) !== JSON.stringify(currentCart)) {
            if (validItems.length < currentCart.length) {
              toast.warning(
                "Alguns itens do seu carrinho não estão mais disponíveis e foram removidos."
              );
            }

            setCart(validItems);

            if (user) debouncedReplace(validItems);
          }
        } catch (err) {
          console.error("Erro refreshCartStock", err);
        }
      }
    },
    [user, debouncedReplace]
  );

  // Chama o refresh ao montar
  useEffect(() => {
    if (cart.length > 0 && !stockRefreshed.current) {
      stockRefreshed.current = true;
      refreshCartStock(cart);
    }
  }, [cart, refreshCartStock]);

  const fetchCart = useCallback(async () => {
    try {
      const mergedAt = localStorage.getItem("cart_merged_at");
      if (mergedAt) {
        const diff = Date.now() - Number(mergedAt);
        if (!Number.isNaN(diff) && diff < 3000) {
          localStorage.removeItem("cart_merged_at");
          return;
        } else {
          localStorage.removeItem("cart_merged_at");
        }
      }
    } catch (err) {
      console.warn("fetchCart -> localStorage read failed:", err);
    }

    if (!user) return;

    try {
      const res = await doFetch(`${API_BASE}/cart`);
      if (!res.ok) throw new Error(`GET /cart ${res.status}`);

      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];

      const localRaw = localStorage.getItem("cart");
      const localItems = localRaw ? JSON.parse(localRaw) : [];

      if (localItems.length > items.length) {
        console.warn("Sync: Local tem mais itens. Atualizando servidor...");
        replaceOnServer(localItems);
      } else {
        setCart(items);
        cartRef.current = items;
        localStorage.setItem("cart", JSON.stringify(items));
      }
    } catch (err) {
      console.error("fetchCart error:", err);
    }
  }, [doFetch, user, replaceOnServer]);

  useEffect(() => {
    if (!initialized) return;

    if (user) {
      fetchCart();
    } else {
      const local = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(local);
    }
  }, [user, initialized, fetchCart]);

  //-----------------------------------

  useEffect(() => {
    const onCartMerged = (e) => {
      try {
        const items = (e && e.detail) || [];
        setCart(items);
        cartRef.current = items;
        localStorage.setItem("cart", JSON.stringify(items));
        stockRefreshed.current = true;
      } catch (err) {
        console.error("onCartMerged error:", err);
      }
    };

    const onLogout = () => {
      setCart([]);
      cartRef.current = [];
      localStorage.removeItem("cart");
      stockRefreshed.current = false;
    };

    window.addEventListener("shop:cartMerged", onCartMerged);
    window.addEventListener("shop:logout", onLogout);
    return () => {
      window.removeEventListener("shop:cartMerged", onCartMerged);
      window.removeEventListener("shop:logout", onLogout);
    };
  }, []);

  //-----------------------------------

  const fetchOld = useCallback(
    async (page = 1) => {
      if (oldControllerRef.current) {
        oldControllerRef.current.abort();
      }
      const controller = new AbortController();
      oldControllerRef.current = controller;

      setIsLoadingOld(true);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: oldLimit.toString(),
          onlyOld: "true",
        });
        const response = await fetchDataForm(
          `/dashboard?${params}`,
          "GET",
          undefined,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }

        const { products = [], totalPages = 1 } = await response.json();
        setOldProducts(products);
        setOldTotalPages(totalPages);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("fetchOld error:", err);
        }
      } finally {
        setIsLoadingOld(false);

        if (oldControllerRef.current === controller)
          oldControllerRef.current = null;
      }
    },
    [oldLimit]
  );

  useEffect(() => {
    fetchOld(oldPage);

    return () => {
      if (oldControllerRef.current) oldControllerRef.current.abort();
    };
  }, [fetchOld, oldPage]);

  const updateProductList = useCallback(
    async (queryUrl = {}) => {
      if (listControllerRef.current) {
        listControllerRef.current.abort();
      }
      const controller = new AbortController();
      listControllerRef.current = controller;

      setIsLoading(true);

      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...queryUrl,
        });

        const response = await fetchDataForm(
          `/dashboard?${query}`,
          "GET",
          undefined,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ${response.status}`);
        }

        const data = await response.json();
        const products = data.products || [];

        const now = Date.now();
        const enriched = products.map((p) => ({
          ...p,
          isNew: now - new Date(p.timestamp) < 7 * 24 * 3600 * 1000,
          isOld: now - new Date(p.timestamp) >= 7 * 24 * 3600 * 1000,
        }));

        setTotalPages(data.totalPages ?? null);
        setTotal(data.total ?? null);
        setDataForm(enriched);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("updateProductList error:", err);
        }
      } finally {
        setIsLoading(false);

        if (listControllerRef.current === controller)
          listControllerRef.current = null;
      }
    },
    [page, limit]
  );

  useEffect(() => {
    updateProductList();

    return () => {
      if (listControllerRef.current) listControllerRef.current.abort();
    };
  }, [updateProductList]);

  //-----------------------------------

  useEffect(() => {
    if (!dataForm || !dataForm.length) return;
    setCart((prev) =>
      prev.map((item) => {
        const prod = dataForm.find((p) => p.product_id === item.product_id);
        return prod
          ? {
              ...item,
              name: prod.name ?? item.name,
              price: prod.price ?? item.price,
              image: prod.image ?? item.image,
              size: prod.size ?? item.size,
            }
          : item;
      })
    );
  }, [dataForm]);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart || []));
    } catch (err) {
      console.error("Error saving cart to localStorage", err);
    }
  }, [cart]);

  const lastAddRef = useRef({ key: null, ts: 0 });
  const addToCart = useCallback(
    (product, quantity = 1, { increment = false } = {}) => {
      if (!product || quantity <= 0) return;

      const key = `${product.product_id}:${
        increment ? "inc" : "set"
      }:${quantity}`;
      const now = Date.now();
      if (lastAddRef.current.key === key && now - lastAddRef.current.ts < 700) {
        return;
      }
      lastAddRef.current = { key, ts: now };

      setCart((prev) => {
        const idx = prev.findIndex((p) => p.product_id === product.product_id);
        const next = [...prev];

        const maxStock = Number(product.quantity ?? product.stock ?? 999);

        let newQty = Number(quantity);

        if (idx >= 0) {
          const currentQty = Number(prev[idx].quantity);
          newQty = increment ? currentQty + Number(quantity) : Number(quantity);

          // TRAVA AQUI
          if (newQty > maxStock) {
            toast.info(`Limite de estoque atingido: ${maxStock} unid.`);
            return prev;
          }

          next[idx] = { ...prev[idx], quantity: newQty, stock: maxStock };
          toast.success("Carrinho atualizado!");
        } else {
          if (newQty > maxStock) {
            toast.info("Quantidade indisponível.");
            return prev;
          }
          next.push({ ...product, quantity: newQty, stock: maxStock });
          toast.success("Adicionado ao carrinho!");
        }

        if (user) debouncedReplace(next);
        return next;
      });
    },
    [debouncedReplace, user]
  );

  const updateQuantity = useCallback(
    (productId, newQuantity) => {
      if (newQuantity < 0) return;
      setCart((prev) => {
        const item = prev.find((p) => p.product_id === productId);
        if (!item) return prev;

        // Procura estoque no item do carrinho ou na lista global
        const stock =
          item.stock !== undefined
            ? Number(item.stock)
            : (dataForm.find((p) => p.product_id === productId)?.quantity ??
              999);

        // TRAVA AQUI
        if (newQuantity > stock) {
          toast.info(`Apenas ${stock} disponíveis.`);
          return prev;
        }

        const next = prev.map((p) =>
          p.product_id === productId ? { ...p, quantity: newQuantity } : p
        );

        if (user) debouncedReplace(next);
        return next;
      });
    },
    [debouncedReplace, user, dataForm]
  );

  const removeFromCart = useCallback(
    (productId) => {
      setCart((prev) => {
        const next = prev.filter((p) => p.product_id !== productId);
        try {
          localStorage.setItem("cart", JSON.stringify(next));
        } catch (e) {
          console.warn("removeFromCart -> localStorage write failed:", e);
        }
        if (user) {
          replaceOnServer(next).catch((e) => {
            console.warn("Immediate replaceOnServer failed:", e);
            debouncedReplace(next);
          });
        } else {
          debouncedReplace(next);
        }
        return next;
      });
    },
    [debouncedReplace, user, replaceOnServer]
  );

  //----------------------------------

  useEffect(() => {
    updateProductList();
  }, [page, limit, updateProductList]);

  return (
    <productContext.Provider
      value={{
        dataForm,
        setDataForm,
        updateProductList,
        isLoading,
        page,
        setPage,
        totalPages,
        total,
        limit,
        setLimit,
        oldProducts,
        isLoadingOld,
        oldPage,
        setOldPage,
        oldTotalPages,
        oldLimit,
        fetchOld,
        cart,
        setCart,
        value,
        setValue,
        addToCart,
        updateQuantity,
        removeFromCart,
        handleAddCart: (product) => addToCart(product, value),
        productId,
        setProductId,
        setProductToLocalStorage: (c) =>
          localStorage.setItem("cart", JSON.stringify(c)),
        refreshCartStock: () => refreshCartStock(cart),
      }}
    >
      {children}
    </productContext.Provider>
  );
};

ProductProvider.propTypes = {
  children: PropTypes.any,
};

export default ProductProvider;
