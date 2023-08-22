"use client";

import _ from "lodash";
import { useMemo } from "react";
import Category from "./category";
import { useQuery } from "@tanstack/react-query";
import getAttributes from "@app/libs/getAttributes";

interface TraitsProps {
  taxon: string;
  issuer: string;
}

const Traits = ({ taxon, issuer }: TraitsProps) => {
  const { data, isLoading, error } = useQuery(
    ["collections-attributes", issuer, taxon],
    () => getAttributes(issuer, taxon)
  );

  const attributes = useMemo(() => {
    if (!data) return null;

    const groupie = _.groupBy(data, "key");

    return Object.keys(groupie).map(key => ({
      name: key,
      attributes: groupie[key]?.map(attribute => attribute.value),
    }));
  }, [data]);

  console.log(attributes);

  return !isLoading && !error ? (
    <div className="category">
      <div className="category__title traits">
        <div className="text">
          <p className="value">Traits</p>
        </div>
      </div>

      {attributes
        ?.filter(trait => trait?.name !== "Attribute Count")
        .map((trait, index) => {
          return (
            <Category
              isTrait
              key={index}
              title={trait?.name}
              defaultState={false}
              options={trait?.attributes || []}
            />
          );
        })}
    </div>
  ) : (
    <></>
  );
};

export default Traits;
