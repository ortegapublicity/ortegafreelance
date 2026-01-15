import React from "react";
import { useTranslation } from 'react-i18next';

import Services from "../Components/Services/Services";
import Metting from "../Components/Metting/Metting";
import WorkeProcess from "../Components/WorkeProcess/WorkeProcess";
import Pricing from "../Components/Pricing/Pricing";
import PageHeader from "../Components/Shared/PageHeader/PageHeader";

const AllServices = () => {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader heading={t('allServices.header.heading')} page={t('allServices.header.page')} />
      <Services isHeading={false} />
      <Metting />
      <Pricing />
      <WorkeProcess />
    </>
  );
};

export default AllServices;
