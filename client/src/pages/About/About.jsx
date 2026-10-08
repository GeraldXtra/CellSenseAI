import PhoneImage from "../../components/shared/PhoneImage.jsx";
import "./About.css";

const heroPhone = {
  brand: "Samsung",
  model: "Galaxy S24",
  imageUrl: "/phones/samsung-galaxy-s24.png",
};

export default function About() {
  return (
    <>
      <section className="cs-section">
        <div className="cs-container about-intro">
          <h1 className="cs-heading">About CellSense AI</h1>
          <p className="cs-subheading">A phone information website built for ASKME Ltd.</p>
          <div className="about-phone">
            <PhoneImage phone={heroPhone} />
          </div>
        </div>
      </section>

      <section id="about" className="cs-section cs-section-alt about-band">
        <div className="cs-container">
          <h2 className="cs-heading about-title">About CellSense AI</h2>
          <p className="about-text">
            CellSense AI helps people find a phone by budget, camera, battery and brand. You can
            search in plain words, compare phones side by side, get a recommendation and ask the
            assistant.
          </p>
        </div>
      </section>

      <section id="askme" className="cs-section about-band">
        <div className="cs-container">
          <h2 className="cs-heading about-title">ASKME Ltd.</h2>
          <p className="about-text">
            ASKME Ltd. answers customer questions by telephone. Most calls are about phones. This
            site answers those questions so nobody has to call.
          </p>
        </div>
      </section>

      <section id="how-prices-work" className="cs-section cs-section-alt about-band">
        <div className="cs-container">
          <h2 className="cs-heading about-title">How prices work</h2>
          <p className="about-text">
            Every price shows the date it was checked. Prices are guide prices, not live shop
            prices, and each phone page shows how the price has moved.
          </p>
        </div>
      </section>

      <section id="contact" className="cs-section about-band">
        <div className="cs-container">
          <h2 className="cs-heading about-title">Contact</h2>
          <p className="about-text">
            Write to us at{" "}
            <a href="mailto:contact@cellsense.example" className="about-mail">
              contact@cellsense.example
            </a>{" "}
            with questions or corrections.
          </p>
        </div>
      </section>
    </>
  );
}
