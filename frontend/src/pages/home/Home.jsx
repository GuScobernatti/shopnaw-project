import logoShopnaw from "../../assets/novalogo.jpeg";
import "./Home.scss";
import { FaWhatsapp } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import WhatsappImage from "../../assets/whatsapp.png";
import InstagramImage from "../../assets/instagram.png";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <section className="sec">
        <div></div>
        <div>
          <img src={logoShopnaw} />
        </div>
      </section>

      <main>
        <section className="section1">
          <span id="shopNaw">Shop Naw</span>
          <div>
            <FaWhatsapp id="whatsappIcon" />
            <FaInstagram id="instagramIcon" />
          </div>
        </section>

        <section className="section2">
          <div onClick={() => navigate("/site")}>
            <img src={logoShopnaw} />
            <span>Nosso site</span>
          </div>
          <div>
            <img src={WhatsappImage} />
            <span>Suporte Whatsapp</span>
          </div>
          <div>
            <img src={InstagramImage} />
            <span>Login • Instagram</span>
          </div>
        </section>

        <section className="section3">
          <span>
            Estilo, graça e sofisticação em cada peça. Encontre o look perfeito
            para você.
          </span>
        </section>
      </main>
    </>
  );
}

export default Home;
