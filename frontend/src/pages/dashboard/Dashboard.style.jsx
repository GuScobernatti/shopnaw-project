import styled from "styled-components";

export const SectionDashboard = styled.section`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;

  @media (max-width: 980px) {
    flex-direction: column;
  }
`;

export const ContentWrapper = styled.main`
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
  overflow-y: auto;
  height: 100%;

  @media (max-width: 980px) {
    width: 100%;
    padding: 10px;
  }
`;

export const ContainerHamburger = styled.div`
  position: relative;
  z-index: 1;
  display: none;

  > svg {
    z-index: 100;
    color: #000;
    height: 30px;
    height: 30px;
    font-size: 1.7rem;
    cursor: pointer;
  }

  @media (max-width: 980px) {
    display: flex;
  }
`;

export const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

export const HeaderComponent = styled.header`
  width: 100%;
  height: 100px;
  margin: 0 auto;
  border-bottom: 1px solid #e3e3e3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  user-select: none;
  background-color: #fff;
  z-index: 1100;
  flex-shrink: 0;
  z-index: 100;

  .logoContent {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;

    img {
      width: 70px;
      height: 70px;
      border-radius: 50%;
    }

    .logo-name {
      font-size: 1.5rem;
      font-weight: 600;
    }
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;

    .icon {
      font-size: 1.2rem;
      cursor: pointer;
    }

    .dropDownAccount {
      top: 3em;
      right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 150px;
      height: 100px;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      z-index: 100;
      transition: all 0.3s ease;
      background-color: #fff;

      &::before {
        content: "";
        display: block;
        position: absolute;
        top: -8px;
        right: 15px;
        border-bottom: 8px solid pink;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;

        @media (max-width: 768px) {
          right: 40px;
        }
      }

      button {
        width: 90%;
        background-color: #fff;
        border: 1px solid pink;
        color: pink;
        padding: 5px 7px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
      }

      .signUp {
        border-top: 1px solid #e3e3e3;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;

        p {
          margin-top: 5px;
          font-size: 0.9rem;
        }

        span {
          font-size: 0.75rem;
        }
      }
    }
  }

  @media (max-width: 1000px) {
    .logo-name {
      display: none;
    }
  }
`;
