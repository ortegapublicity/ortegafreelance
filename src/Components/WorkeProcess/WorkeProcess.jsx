import React from "react";
import Title from "../Shared/Title/Title";
import WorkProcessCard from "./WorkProcessCard";
import { useTranslation } from 'react-i18next';

const processList = [
  {
    id: 1,
    title: "workeprocess.process1.title",
    info: "workeprocess.process1.info",
    list: [
      "workeprocess.process1.list.0",
      "workeprocess.process1.list.1",
      "workeprocess.process1.list.2",
    ],
  },
  {
    id: 2,
    title: "workeprocess.process2.title",
    info: "workeprocess.process2.info",
    list: [
      "workeprocess.process2.list.0",
      "workeprocess.process2.list.1",
      "workeprocess.process2.list.2",
    ],
  },
  {
    id: 3,
    title: "workeprocess.process3.title",
    info: "workeprocess.process3.info",
    list: [
      "workeprocess.process3.list.0",
      "workeprocess.process3.list.1",
      "workeprocess.process3.list.2",
    ],
  },
];
const WorkeProcess = () => {
  const { t } = useTranslation();

  return (
    <section className="process__section pt-120 pb-120">
      <div className="container">
        <Title
          mainTitle={t('workeprocess.header.mainTitle')}
          sortTitle={t('workeprocess.header.sortTitle')}
        />
        <div className="row g-4">
          {processList.map(({ id, info, list, title }) => (
            <WorkProcessCard key={id} info={t(info)} list={list.map(li => t(li))} title={t(title)} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkeProcess;
