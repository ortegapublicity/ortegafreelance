import React from "react";
import { useTranslation } from "react-i18next";
import basic from "../../assets/img/project/basic.png";
import warranty from "../../assets/img/project/warranty.png";
import premium from "../../assets/img/project/premium-quality.png";
import Price from "./Price";
import Title from "../Shared/Title/Title";

const Pricing = () => {
  const { t } = useTranslation();

  const planData = [
    {
      id: 1,
      planName: t("services.pricing.plan3.name"),
      price: "$2250",
      time: t("services.pricing.time.web"),
      description: t("services.pricing.plan3.description"),
      result: t("services.pricing.plan3.result"),
      fetcher: t("services.pricing.plan3.features", { returnObjects: true }),
      image: premium,
    },
    {
      id: 2,
      planName: t("services.pricing.plan1.name"),
      price: "$1050",
      time: t("services.pricing.time.perQuarter"),
      description: t("services.pricing.plan1.description"),
      result: t("services.pricing.plan1.result"),
      fetcher: t("services.pricing.plan1.features", { returnObjects: true }),
      image: basic,
    },
    {
      id: 3,
      planName: t("services.pricing.plan2.name"),
      price: "$1650",
      time: t("services.pricing.time.perQuarter"),
      description: t("services.pricing.plan2.description"),
      result: t("services.pricing.plan2.result"),
      fetcher: t("services.pricing.plan2.features", { returnObjects: true }),
      image: warranty,
    },
  ];

  return (
    <section className="pricing__section pt-120 pb-120">
      <div className="container">
        <Title
          mainTitle={t("services.pricing.title")}
          sortTitle={t("services.pricing.subtitle")}
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
