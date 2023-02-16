import moment from "moment";

export const stakeFunction = (selectedNumbers, amount) => {
   const determiner = selectedNumbers - 1;
   const permTotal = (selectedNumbers * determiner) * amount;
   return permTotal / 2 || 0;
}

export const formatNumber = (amount) => {
   const f = new Intl.NumberFormat("en-us", {
      maximumFractionDigits: 2
   })
   return f.format(amount);
}
//
export const gameDescription = (date) => {
   const day = moment(date).day();
   let name = ''
   switch (day) {
      case 0: name = 'Sunday Aseda'
      break;
      case 1: name = 'Monday Special'
           break;
      case 2: name = 'Lucky Tuesday'
           break;
      case 3: name = "Mid-Week"
           break;
      case 4: name = 'Fortune Thursday'
           break;
      case 5: name = 'Friday Bonanza'
           break;
      case 6: name = 'National Weekly'
           break;
      default: name = ''
           break;
   }

   return name;
}



