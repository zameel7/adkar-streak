import React from "react";
import EveningAdkarData from "@/assets/adkars/evening.json";
import AdkarScreen from "@/components/AdkarScreen";

const EveningAdkar = () => {
    return <AdkarScreen adkarData={EveningAdkarData} type="evening" />;
};

export default EveningAdkar;