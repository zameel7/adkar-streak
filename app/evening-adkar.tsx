import EveningAdkarData from "@/assets/adkars/evening.json";
import AdkarScreen from "@/components/AdkarScreen";
import React from "react";

const EveningAdkar = () => {
    return <AdkarScreen adkarData={EveningAdkarData} type="evening" />;
};

export default EveningAdkar;