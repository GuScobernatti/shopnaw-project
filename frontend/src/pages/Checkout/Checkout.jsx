import { useEffect, useContext, useMemo, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { useNavigate, useLocation } from "react-router-dom";
import productContext from "../../contexts/productContext/createProductContext";
import authContext from "../../contexts/loginContext/createAuthContext";
import { API_BASE } from "../../api";
import {
  CheckoutContainer,
  PaymentSection,
  SummarySection,
  SectionInfo,
} from "./Checkout.style";
import { toast } from "react-toastify";
import AddressForm from "../../components/AddressForm/AddressForm";
import promotionsContext from "../../contexts/promotionsContext/createPromotionContext";

function Checkout() {
  const { cart, setCart, refreshCartStock } = useContext(productContext);
  const { user, authFetch } = useContext(authContext);
  const { applyOffers } = useContext(promotionsContext);
  const [address, setAddress] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const shippingFromCart = location.state?.shipping || null;
  const zipCodeFromCart = location.state?.zipCode || "";

  useEffect(() => {
    initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, {
      locale: "pt-BR",
    });
  }, []);

  const totalAmount = useMemo(() => {
    const productsTotal = cart.reduce((acc, item) => {
      const { price } = applyOffers(item);
      return acc + Number(price) * Number(item.quantity);
    }, 0);

    const shippingPrice = shippingFromCart ? Number(shippingFromCart.price) : 0;

    return productsTotal + shippingPrice;
  }, [cart, applyOffers, shippingFromCart]);

  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      navigate("/site");
    }
  }, [cart, navigate, isSuccess]);

  const initialization = {
    amount: totalAmount,
    payer: {
      email: user?.email,
      entity_type: "individual",
    },
  };

  const customization = {
    paymentMethods: {
      ticket: "all",
      bankTransfer: "all", // Habilita PIX
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
    visual: {
      style: {
        theme: "default", // 'default' | 'dark' | 'bootstrap' | 'flat'
      },
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }) => {
    try {
      if (!formData.payer.email && user?.email) {
        formData.payer.email = user.email;
      }

      const payload = {
        formData,
        items: cart,
        userId: user?.userId,
        userEmail: user?.email,
        address: address,
        shippingCost: shippingFromCart ? shippingFromCart.price : 0,
        shippingMethod: shippingFromCart ? shippingFromCart.name : "Retirar",
        paymentMethodType: selectedPaymentMethod, // Enviando informação extra se quiser usar no log
      };

      const response = await authFetch(`${API_BASE}/checkout/process_payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setCart([]);
        localStorage.removeItem("cart");

        navigate("/checkout/success", {
          state: {
            orderId: data.orderId,
            status: data.status,
            ticketUrl: data.ticketUrl,
          },
        });
      } else {
        console.error(data);
        if (data.details && data.details.includes("Estoque insuficiente")) {
          toast.error("Alguns itens do seu carrinho acabaram de esgotar!");
          await refreshCartStock();
          return;
        }
        toast.error("Erro: " + (data.error || "Pagamento recusado."));
        return;
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão.");
    }
  };

  const onError = async (error) => {
    console.log(error);
  };

  const onReady = async () => {};

  if (cart.length === 0) return null;

  return (
    <CheckoutContainer>
      <SectionInfo isCompleted={!!address}>
        <SummarySection>
          <h2>Resumo do Pedido</h2>
          {cart.map((item) => {
            const { price, discountLabel } = applyOffers(item);

            return (
              <div className="item" key={item.product_id}>
                <span>
                  {item.quantity}x {item.name}
                  {discountLabel && (
                    <small
                      style={{
                        color: "#2e7d32",
                        marginLeft: "5px",
                        fontSize: "0.8em",
                      }}
                    >
                      ({discountLabel})
                    </small>
                  )}
                </span>
                <span>
                  {(Number(price) * item.quantity).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            );
          })}

          {shippingFromCart && (
            <div className="item">
              <span>Frete ({shippingFromCart.name})</span>
              <span>
                {shippingFromCart.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          )}

          <div className="total">
            <span>Total</span>
            <span>
              {totalAmount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        </SummarySection>

        <AddressForm
          onAddressSaved={setAddress}
          authFetch={authFetch}
          initialZip={zipCodeFromCart}
        />
      </SectionInfo>

      {address && (
        <PaymentSection>
          <h2>Pagamento</h2>
          <Payment
            key={totalAmount}
            initialization={initialization}
            customization={customization}
            onSubmit={onSubmit}
            onReady={onReady}
            onError={onError}
          />
        </PaymentSection>
      )}
    </CheckoutContainer>
  );
}

export default Checkout;
