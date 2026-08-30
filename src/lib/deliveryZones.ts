export type DeliveryZoneId = "porto" | "innerRing" | "outerRing";

export const DELIVERY_ZONES: {
  id: DeliveryZoneId;
  label: string;
  municipalities: string[];
}[] = [
  {
    id: "porto",
    label: "Porto",
    municipalities: ["Porto"],
  },
  {
    id: "innerRing",
    label: "Inner AMP",
    municipalities: [
      "Vila Nova de Gaia",
      "Matosinhos",
      "Maia",
      "Gondomar",
      "Valongo",
    ],
  },
  {
    id: "outerRing",
    label: "Outer AMP",
    municipalities: [
      "Espinho",
      "Vila do Conde",
      "Póvoa de Varzim",
      "Santo Tirso",
      "Trofa",
      "Paredes",
      "Santa Maria da Feira",
      "São João da Madeira",
    ],
  },
];

export const MUNICIPALITY_TO_ZONE: Record<string, DeliveryZoneId> =
  Object.fromEntries(
    DELIVERY_ZONES.flatMap((zone) =>
      zone.municipalities.map((city) => [city, zone.id])
    )
  );

export const AMP_MUNICIPALITIES = DELIVERY_ZONES;

type ZoneFees = {
  porto?: number;
  innerRing?: number;
  outerRing?: number;
};

export function resolveDeliveryFee(
  store: { deliveryFee?: number; deliveryZoneFees?: ZoneFees },
  city: string
): { fee: number; zone: DeliveryZoneId } | { error: "outside_service_area" } {
  const zone = MUNICIPALITY_TO_ZONE[city];
  if (!zone) {
    return { error: "outside_service_area" };
  }

  const zoneFee = store.deliveryZoneFees?.[zone];
  const fee = typeof zoneFee === "number" ? zoneFee : Number(store.deliveryFee || 0);

  return { fee, zone };
}
