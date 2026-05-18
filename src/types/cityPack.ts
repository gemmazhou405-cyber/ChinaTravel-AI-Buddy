export interface CityPack {
  cityId: string;
  cityName: string;
  cityNameCN: string;
  airport: {
    name: string;
    iataCode: string;
    toCity: string;
  };
  transport: {
    metro: string;
    taxi: string;
    didi: string;
    tips: string[];
  };
  payment: {
    alipay: string;
    wechatPay: string;
    cash: string;
    foreignCard: string;
  };
  accommodation: {
    recommendedAreas: string[];
    tips: string[];
  };
  food: {
    mustTry: string[];
    foodStreets: string[];
    tips: string[];
  };
  commonScams: string[];
  emergency: {
    police: string;
    ambulance: string;
    fire: string;
    localTip: string;
  };
  usefulApps: string[];
  bestTimeToVisit: string;
  touristTips: string[];
}
