import * as React from "react";
import { useState, useEffect } from "react";
import Network from "utils/network";
import { Column } from "components/table/Column";
import { Table } from "components/table/Table";
import { AsyncButton } from "components/buttons";

interface StateSource {
  id: number;
  name: string;
  type: "STATE" | "CONFIG" | "FORMULA" | "INTERNAL";
  sourceId: number;
  sourceName: string;
  sourceType: "SYSTEM" | "GROUP" | "ORG";
}

function requestHighstate(id: number) {
  return Network.get("/rhn/manager/api/states/highstate?sid=" + id).promise;
}

export default function HighstateSummary({ minionId }) {
  const [summary, setSummary] = useState<StateSource[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Network.get(`/rhn/manager/api/states/summary?sid=${minionId}`).promise
      .then(setSummary)
      .then(() => setLoading(false));
  }, [minionId]);

  if (isLoading) {
    return (
      <div className="row">
        <span>Retrieving highstate summary...</span>
      </div>
    );
  }

  return (
    <>
      <Table identifier={state => state.state} data={summary} initialItemsPerPage={0}>
        <Column header={t("Source of States")} columnKey="state" cell={source => <State state={source} />} />
        <Column header={t("Inherited or Assigned")} columnKey="source" cell={source => <Source minionId={minionId} source={source} />} />
      </Table>
      <HighstateOutput minionId={minionId} />
    </>
  );
}

function HighstateOutput({ minionId }) {
  const [highstate, setHighstate] = useState("");

  if (!highstate) {
    return (
      <AsyncButton
        icon="fa-file-text-o"
        text={t("Show full highstate output")}
        action={() => requestHighstate(minionId).then(setHighstate)}
        defaultType="btn-link" />
    );
  }

  return (
    <div className="row">
      <pre>{highstate}</pre>
    </div >
  );
}

function State({ state }: { state: StateSource }) {
  if (state.type === "STATE") {
    return (
      <>
        <i className="spacewalk-icon-software-channels" />
        {t("State channel")} <strong><a href={`/rhn/configuration/ChannelOverview.do?ccid=${state.id}`}>{state.name}</a></strong>
      </>
    );
  } else if (state.type === "CONFIG") {
    return (
      <>
        <i className="spacewalk-icon-software-channels" />
        {t("Config channel")} <strong><a href={`/rhn/configuration/ChannelOverview.do?ccid=${state.id}`}>{state.name}</a></strong>
      </>
    );
  } else if (state.type === "FORMULA") {
    return (
      <>
        <i className="spacewalk-icon-salt" />
        {t("Formula")} <strong>{state.name}</strong>
      </>
    );
  } else if (state.type === "INTERNAL") {
    return (
      <>
        <i className="spacewalk-icon-salt" />
        <i>{t("Internal states")}</i>
      </>
    );
  }
  return null;
}

function Source({ minionId, source }: { minionId: number, source: StateSource }) {
  const srcType = source.type === "FORMULA" ? "formulas" : "custom";

  if (source.type === "INTERNAL") {
    return (<span>-</span>);
  } else if (source.sourceType === "SYSTEM") {
    const srcTypeName = source.type === "FORMULA" ? t("Formulas") : t("Configuration Channels");
    return (
      <>
        {t("Directly assigned in")} <a href={`/rhn/manager/systems/details/${srcType}?sid=${minionId}`}>{srcTypeName}</a>
      </>
    );
  } else if (source.sourceType === "GROUP") {
    return (
      <>
        {t("Inherited from system group")} <a href={`/rhn/manager/groups/details/${srcType}?sgid=${source.sourceId}`}>{source.sourceName}</a>
      </>
    );
  } else if (source.sourceType === "ORG") {
    return (
      <>
        {t("Inherited from organization")} <a href={`/rhn/manager/multiorg/details/custom?oid=${source.sourceId}`}>{source.sourceName}</a>
      </>
    );
  }
  return null;
}