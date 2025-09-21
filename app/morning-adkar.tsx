import React from "react";
import MorningAdkarData from "@/assets/adkars/morning.json";
import AdkarScreen from "@/components/AdkarScreen";

const MorningAdkar = () => {
    return <AdkarScreen adkarData={MorningAdkarData} type="morning" />;
};

export default MorningAdkar;
