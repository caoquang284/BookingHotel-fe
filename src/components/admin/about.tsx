import React from "react";

interface AboutItem {
  icon: React.ReactNode;
  count: number | string;
  text: string;
}

const about: AboutItem[] = [
  {
    icon: <i className="fa fa-hotel fa-2x text-primary mb-3"></i>,
    count: 123,
    text: "Rooms",
  },
  {
    icon: <i className="fa fa-users fa-2x text-primary mb-3"></i>,
    count: 456,
    text: "Guests",
  },
  {
    icon: <i className="fa fa-cutlery fa-2x text-primary mb-3"></i>,
    count: 789,
    text: "Dishes",
  },
];

const imageLinks = [
  "https://static.independent.co.uk/2025/04/07/14/09/HS-MBH-Exterior-03.jpg",
  "https://luxuryescapes.com/inspiration/wp-content/uploads/2023/06/nh999jb5bo61avqid5c-e1687143719181.webp",
  "https://i0.wp.com/theluxurytravelexpert.com/wp-content/uploads/2019/11/best-luxury-and-most-exclusive-hotels-brands-in-the-world.jpg?fit=1300%2C731&ssl=1",
  "https://www.signatureluxurytravel.com.au/wp-content/uploads/2000/02/CTS-RM-8888-A-TRRCE-FINAL-01A.jpg",
];

const About: React.FC = () => {
  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6">
            <h6 className="section-title text-start text-primary text-uppercase">
              About Us
            </h6>
            <h1 className="mb-4">
              Welcome to{" "}
              <span className="text-primary text-uppercase">Hotelier</span>
            </h1>
            <p className="mb-4">
              Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu
              diam amet diam et eos. Clita erat ipsum et lorem et sit, sed stet
              lorem sit clita duo justo magna dolore erat amet
            </p>
            <div className="row g-3 pb-4">
              {about.map((item, index) => (
                <div
                  key={index}
                  className="col-sm-4 wow fadeIn"
                  data-wow-delay="0.1s"
                >
                  <div className="border rounded p-1">
                    <div className="border rounded text-center p-4">
                      {item.icon}
                      <h2 className="mb-1" data-toggle="counter-up">
                        {item.count}
                      </h2>
                      <p className="mb-0">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <a className="btn btn-primary py-3 px-5 mt-2" href="">
              Explore More
            </a>
          </div>
          <div className="col-lg-6">
            <div className="row g-3">
              <div className="col-6 text-end">
                <img
                  className="img-fluid rounded w-75 wow zoomIn"
                  data-wow-delay="0.1s"
                  src="imageLinks[0]"
                  style={{ marginTop: "25%" }}
                  alt="about-1"
                />
              </div>
              <div className="col-6 text-start">
                <img
                  className="img-fluid rounded w-100 wow zoomIn"
                  data-wow-delay="0.3s"
                  src="/imageLinks[1]"
                  alt="about-2"
                />
              </div>
              <div className="col-6 text-end">
                <img
                  className="img-fluid rounded w-50 wow zoomIn"
                  data-wow-delay="0.5s"
                  src="/imageLinks[2]"
                  alt="about-3"
                />
              </div>
              <div className="col-6 text-start">
                <img
                  className="img-fluid rounded w-75 wow zoomIn"
                  data-wow-delay="0.7s"
                  src="/imageLinks[3]"
                  alt="about-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
