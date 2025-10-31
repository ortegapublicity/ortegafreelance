import React from "react";
import basic from "../../assets/img/project/basic.png";
import warranty from "../../assets/img/project/warranty.png";
import premium from "../../assets/img/project/premium-quality.png";
import Price from "./Price";
import Title from "../Shared/Title/Title";
const planData = [
  {
    id: 1,
    planName: "Digital Advertising",
    price: "$1050",
    time: "per Quarter",
    description:
      "For businesses ready to boost visibility and sales through paid media. This plan focuses on high-performing ad campaigns and professional content that converts — ideal for startups or small eCommerce brands.",
    result:
      "Result: Stronger reach, optimized ad spend, and consistent monthly conversions.",
    fetcher: [
      "Project Management",
      "Advertising Campaigns",
      "Base Content Creation",
    ],
    image: basic,
  },
  {
    id: 2,
    planName: "Complete Digital Marketing",
    price: "$1650",
    time: "per Quarter",
    description:
      "For brands ready to grow their presence and reputation online. A complete marketing foundation that connects branding, content, and performance to position your business as a market leader.",
    result:
      "Result: A unified brand image with campaigns that attract, nurture, and convert your ideal clients.",
    fetcher: [
      "Project Management",
      "Advertising Campaigns",
      "Base Content Creation",
      "Full Business Branding",
      "Video Editing",
    ],
    image: warranty,
  },
  {
    id: 3,
    planName: "Premium 360 Plan",
    price: "$2250",
    time: "per Quarter",
    description:
      "For companies that want a full-scale marketing ecosystem with 360° execution. From strategy to content and web presence — everything works together to generate measurable growth and long-term positioning.",
    result:
      "Result: A high-impact digital presence designed to scale your business sustainably and profitably.",
    fetcher: [
      "Project Management",
      "Advertising Campaigns",
      "Base Content Creation",
      "Full Business Branding",
      "Video Editing",
      "Web Development",
      "Premium Content Creation",
    ],
    image: premium,
  },
];
const Pricing = () => {
  return (
    <section className="pricing__section pt-120 pb-120">
      <div className="container">
        <Title
          mainTitle={"The best pricing plans to get your best"}
          sortTitle={"Choose Your Plan"}
        />
        <div className="row g-4 justify-content-center">
          {planData.map(({ id, image, planName, fetcher, price, time, description, result }) => (
  <Price
    key={id}
    image={image}
    planName={planName}
    price={price}
    time={time}
    fetcher={fetcher}
    id={id}
    description={description}
    result={result}
  />
))}

        </div>
      </div>
    </section>
  );
};

export default Pricing;
