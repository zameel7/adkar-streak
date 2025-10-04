import MorningAdkarData from "@/assets/adkars/morning.json";
import AdkarScreen from "@/components/AdkarScreen";
import React from "react";

const MorningAdkar = () => {
    return <AdkarScreen adkarData={MorningAdkarData} type="morning" />;
};

export default MorningAdkar;
