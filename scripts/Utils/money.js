export function formatCurrency (pirceCents) {
  return(Math.round(pirceCents) / 100).toFixed(2);  
}