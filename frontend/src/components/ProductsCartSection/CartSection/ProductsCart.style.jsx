import styled from "styled-components";

export const CartDiv = styled.div`
  background-color: #fff;
  position: fixed;
  height: 100%;
  right: 0px;
  top: 0px;
  width: 70%;
  min-width: 400px;
  z-index: 1000;
  transform: ${({ isCartOpen }) =>
    isCartOpen ? "translateX(0)" : "translateX(100%)"};
  opacity: ${({ isCartOpen }) => (isCartOpen ? "1" : "0")};
  transition: all 0.4s ease-in-out;

  @media (min-width: 768px) {
    width: 30%;
  }
`;

export const CartHeader = styled.section`
  margin: 0 auto;
  width: 90%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e3e3e3;
  color: #000;

  > svg {
    color: #000;
    width: 30px;
    height: 30px;
    font-size: 1.7rem;

    cursor: pointer;
  }
`;

export const CartHeaderTitle = styled.h2`
  text-transform: uppercase;
  font-size: 1.4rem;
`;

export const CartProductsSection = styled.section`
  width: 90%;
  height: 550px;
  margin: 20px auto 10px;
  padding: 10px;
  overflow: auto;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CartProductCard = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  gap: 5px;
  cursor: pointer;
  border-bottom: 1px solid #e3e3e3;
  padding: 10px;

  img {
    height: 90px;
    width: 70px;
    object-fit: cover;
    border-radius: 12px;
  }
`;

export const ShirtInfoCart = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 3px;
  width: 70%;
  flex: 1;
  padding: 5px;
  font-size: 0.9rem;

  span:nth-child(1) {
    word-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const CartFooter = styled.section`
  width: 90%;
  height: auto;
  margin: 10px auto 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 10px;

  p {
    font-size: 1.15rem;
  }

  button {
    padding: 8px;
    width: 100%;
    font-size: 1.1rem;
    border: none;
    background-color: #82858b;
    color: #fff;
    border-radius: 0.8em;
    cursor: pointer;
  }
`;

export const DivEmptyCart = styled.div`
  margin: 0 auto;
  width: 90%;
  height: 570px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;

  .emptyCartIcon {
    font-size: 2.5rem;
    color: #000;
  }

  .emptyCartText {
    font-size: 1.5rem;
    color: #000;
  }

  .emptyCartSpan {
    font-size: 0.9rem;
    color: #5c5c5c;
    text-align: center;
  }
`;
