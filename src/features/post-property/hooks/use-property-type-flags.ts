export function usePropertyTypeFlags(selectedPropertyType?: string, category?: string) {
  const propertyTypeLower = (selectedPropertyType || "").toLowerCase();
  const isResidentialDetail = /(apartment|villa|house|penthouse|studio|row|floor)/.test(propertyTypeLower);
  const isCommercialDetail = /(office|co-working|shop|showroom|mall|restaurant|cafe|sco)/.test(propertyTypeLower);
  const isIndustrialDetail = /(warehouse|godown|industrial|factory|shed|storage|logistics)/.test(propertyTypeLower);
  const isPlotDetail = /(plot|land|orchard|plantation)/.test(propertyTypeLower);
  const isHospitalityDetail = /(pg|co-living|hostel|serviced|guest|hotel|resort)/.test(propertyTypeLower);
  const shouldShowRooms = isResidentialDetail || (!selectedPropertyType && category === "RESIDENTIAL");
  const shouldShowFurnishing = !isPlotDetail && !/(land)/.test(propertyTypeLower);

  return {
    isResidentialDetail,
    isCommercialDetail,
    isIndustrialDetail,
    isPlotDetail,
    isHospitalityDetail,
    shouldShowRooms,
    shouldShowFurnishing,
  };
}
