
export const stakeFunction = (selectedNumbers, amount) => {
   const determiner = selectedNumbers - 1;
   const permTotal = (selectedNumbers * determiner) * amount;
   return permTotal / 2;
}

export const formatNumber = (amount) => {
   const f = new Intl.NumberFormat("en-us", {
      maximumFractionDigits: 2
   })
   return f.format(amount);
}



