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
    [user, authFetch],
  );

  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Salva no LocalStorage sempre que o cart mudar
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart || []));
    } catch (err) {
      console.error("Error saving cart to localStorage", err);
    }
  }, [cart]);

  const syncingRef = useRef(false);

  // Função para salvar no servidor
  const replaceOnServer = useCallback(
    async (items) => {
      // Se não tiver user, só salva no localStorage (já feito pelo useEffect acima)
      if (!user || !authFetch) return;

      if (syncingRef.current) return;
      syncingRef.current = true;

      try {
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
          console.error("Erro ao salvar carrinho no servidor");
        }
      } catch (err) {
        console.error("replaceOnServer error:", err);
      } finally {
        syncingRef.current = false;
      }
    },
    [authFetch, getCsrfToken, user],
  );

  // Debounce para não spammar o servidor
  const debouncedReplace = useRef(
    debounce((items) => replaceOnServer(items), 500),
  ).current;

  // Função para validar estoque (chamada ao iniciar)
  const refreshCartStock = useCallback(
    async (currentCart) => {
      if (!currentCart || currentCart.length === 0) return;

      try {
        let hasChanges = false;
        const updatedItems = await Promise.all(
          currentCart.map(async (item) => {
            try {
              const res = await fetch(
                `${API_BASE}/dashboard/${item.product_id}`,
              );
              if (res.ok) {
                const data = await res.json();

                // Se produto não existe mais ou sem estoque
                if (!data || !data.product_id) return null;

                const maxStock = Number(data.quantity);
                const currentQty = item.quantity;

                // Se a quantidade no carrinho for maior que o estoque real, ajusta
                const validQty = Math.min(currentQty, maxStock);

                if (validQty !== currentQty || item.stock !== maxStock) {
                  hasChanges = true;
                }

                return {
                  ...item,
                  stock: maxStock,
                  price: data.price,
                  name: data.name,
                  image: data.image,
                  quantity: validQty,
                };
              }
              return item; // Se der erro no fetch, mantem item como está pra não sumir
            } catch {
              return item;
            }
          }),
        );

        const validItems = updatedItems.filter((item) => item !== null);

        // Se houve mudança de estoque ou itens removidos
        if (hasChanges || validItems.length !== currentCart.length) {
          if (validItems.length < currentCart.length) {
            toast.warning("Alguns itens não estão mais disponíveis.");
          }
          setCart(validItems);
          if (user) debouncedReplace(validItems);
        }
      } catch (err) {
        console.error("Erro refreshCartStock", err);
      }
    },
    [user, debouncedReplace],
  );

  // Ao iniciar a sessão, decide se usa o Local ou o Server
  const fetchCart = useCallback(async () => {
    if (!user) return;

    try {
      // 1. Busca versão do servidor
      const res = await doFetch(`${API_BASE}/cart`);
      if (!res.ok) throw new Error(`GET /cart ${res.status}`);
      const data = await res.json();
      const serverItems = Array.isArray(data.items) ? data.items : [];

      // 2. Busca versão local
      const localRaw = localStorage.getItem("cart");
      const localItems = localRaw ? JSON.parse(localRaw) : [];

      // Lógica de Merge: Se o local tiver itens e for diferente do servidor, o local ganha (assumimos que é o mais recente)
      // Se o local estiver vazio, usamos o do servidor.
      if (localItems.length > 0) {
        // Opcional: Você pode comparar timestamps se quiser ser mais preciso,
        // mas assumir que o Local é a "intenção mais recente" do usuário costuma funcionar bem.
        setCart(localItems);
        replaceOnServer(localItems); // Atualiza o servidor com o que está no local
      } else if (serverItems.length > 0) {
        setCart(serverItems);
        localStorage.setItem("cart", JSON.stringify(serverItems));
      }

      // Valida estoque do que foi decidido
      const finalItems = localItems.length > 0 ? localItems : serverItems;
      if (finalItems.length > 0) refreshCartStock(finalItems);
    } catch (err) {
      console.error("fetchCart error:", err);
    }
  }, [doFetch, user, replaceOnServer, refreshCartStock]);

  useEffect(() => {
    if (!initialized) return;

    if (user) {
      fetchCart();
    } else {
      // Se não tem user, confia 100% no local e só valida estoque
      const local = JSON.parse(localStorage.getItem("cart") || "[]");
      if (local.length > 0) refreshCartStock(local);
    }
  }, [user, initialized, fetchCart, refreshCartStock]);

  // ... (FetchOld e UpdateProductList mantêm igual) ...
  const fetchOld = useCallback(
    async (page = 1) => {
      if (oldControllerRef.current) oldControllerRef.current.abort();
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
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        const { products = [], totalPages = 1 } = await response.json();
        setOldProducts(products);
        setOldTotalPages(totalPages);
      } catch (err) {
        if (err.name !== "AbortError") console.error("fetchOld error:", err);
      } finally {
        setIsLoadingOld(false);
        if (oldControllerRef.current === controller)
          oldControllerRef.current = null;
      }
    },
    [oldLimit],
  );

  useEffect(() => {
    fetchOld(oldPage);
    return () => {
      if (oldControllerRef.current) oldControllerRef.current.abort();
    };
  }, [fetchOld, oldPage]);

  const updateProductList = useCallback(
    async (queryUrl = {}) => {
      if (listControllerRef.current) listControllerRef.current.abort();
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
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Erro ${response.status}`);
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
        if (err.name !== "AbortError")
          console.error("updateProductList error:", err);
      } finally {
        setIsLoading(false);
        if (listControllerRef.current === controller)
          listControllerRef.current = null;
      }
    },
    [page, limit],
  );

  useEffect(() => {
    updateProductList();
    return () => {
      if (listControllerRef.current) listControllerRef.current.abort();
    };
  }, [updateProductList]);

  // Lógica de Sincronização LocalStorage e Contexto
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
      }),
    );
  }, [dataForm]);

  // Add to Cart com Debounce
  const addToCart = useCallback(
    (product, quantity = 1, { increment = false } = {}) => {
      if (!product || quantity <= 0) return;

      setCart((prev) => {
        const idx = prev.findIndex((p) => p.product_id === product.product_id);
        const next = [...prev];
        const maxStock = Number(product.quantity ?? product.stock ?? 999);
        let newQty = Number(quantity);

        if (idx >= 0) {
          const currentQty = Number(prev[idx].quantity);
          newQty = increment ? currentQty + Number(quantity) : Number(quantity);

          if (newQty > maxStock) {
            toast.info(`Limite de estoque atingido: ${maxStock} unid.`);
            // Se já tem no carrinho, não muda, mas dispara sync pra garantir
            if (user) debouncedReplace(prev);
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
    [debouncedReplace, user],
  );

  const updateQuantity = useCallback(
    (productId, newQuantity) => {
      if (newQuantity < 0) return;
      setCart((prev) => {
        const item = prev.find((p) => p.product_id === productId);
        if (!item) return prev;

        const stock = item.stock !== undefined ? Number(item.stock) : 999;

        if (newQuantity > stock) {
          toast.info(`Apenas ${stock} disponíveis.`);
          return prev;
        }

        const next = prev.map((p) =>
          p.product_id === productId ? { ...p, quantity: newQuantity } : p,
        );

        if (user) debouncedReplace(next);
        return next;
      });
    },
    [debouncedReplace, user],
  );

  const removeFromCart = useCallback(
    (productId) => {
      setCart((prev) => {
        const next = prev.filter((p) => p.product_id !== productId);
        // Salva direto no server sem debounce para garantir remoção
        if (user) replaceOnServer(next);
        return next;
      });
    },
    [user, replaceOnServer],
  );

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
