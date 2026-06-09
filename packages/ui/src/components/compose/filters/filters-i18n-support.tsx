"use client";

import * as React from "react";
import type { Filter, FilterFieldConfig } from "./filters.shared";
import { Filters, FiltersPatternCard } from "./filters.shared";

const fields: FilterFieldConfig[] = [
  {
    key: "status",
    label: "Statut",
    type: "select",
    options: [
      { value: "actif", label: "Actif" },
      { value: "pause", label: "En pause" },
      { value: "brouillon", label: "Brouillon" },
    ],
  },
  {
    key: "priorite",
    label: "Priorité",
    type: "multiselect",
    options: [
      { value: "basse", label: "Basse" },
      { value: "moyenne", label: "Moyenne" },
      { value: "haute", label: "Haute" },
    ],
  },
];

export function FiltersI18nSupport() {
  const [filters, setFilters] = React.useState<Filter[]>([]);

  return (
    <FiltersPatternCard
      title="With i18n Support"
      description="Translate labels and operator names without changing the component API."
    >
      <Filters
        filters={filters}
        fields={fields}
        onChange={setFilters}
        i18n={{
          addFilter: "Ajouter un filtre",
          searchFields: "Rechercher des champs",
          chooseField: "Choisir un champ",
          chooseOperator: "Opérateur",
          valuePlaceholder: "Saisir une valeur",
          apply: "Appliquer",
          cancel: "Annuler",
          remove: "Supprimer",
          noFields: "Aucun champ trouvé.",
          noResults: "Aucun filtre actif.",
          validation: {
            invalidValue: "La valeur est invalide.",
            required: "Cette valeur est requise.",
          },
          operators: {
            is: "est",
            is_not: "n'est pas",
            contains: "contient",
            starts_with: "commence par",
            ends_with: "se termine par",
            is_any_of: "contient au moins",
            is_not_any_of: "ne contient pas",
            greater_than: "supérieur à",
            less_than: "inférieur à",
            between: "entre",
            is_empty: "est vide",
            is_not_empty: "n'est pas vide",
          },
          placeholders: {
            text: "Saisissez un texte",
            select: "Sélectionnez une option",
            multiselect: "Sélectionnez plusieurs options",
            custom: "Configurez une valeur personnalisée",
          },
        }}
      />
    </FiltersPatternCard>
  );
}
