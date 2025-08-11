import React, { useEffect, useState } from "react";
import { Button, Table, Space } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { getUnits, getArchivedUnits } from "../api/api";

const ZERO = "00000000-0000-0000-0000-000000000000";

export default function UnitsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isArchive = location.pathname.endsWith("/2");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setRows([]);
    try {
      const data = isArchive ? await getArchivedUnits() : await getUnits();
      setRows(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isArchive, location.pathname]);

  const columns = [
    {
      title: "Наименование",
      dataIndex: "name",
      render: (_, r) => (
        <a onClick={() => navigate(`/units/${r.id}?arch=${isArchive ? 1 : 0}`)}>
          {r.name}
        </a>
      ),
    },
  ];

  return (
    <div>
      <h1>Единицы измерения {isArchive ? "(архив)" : ""}</h1>
      <Space style={{ marginBottom: 12 }}>
        {!isArchive && (
          <Button
            type="primary"
            onClick={() => navigate(`/units/form/${ZERO}`)}
          >
            Добавить
          </Button>
        )}
        <Button onClick={() => navigate(isArchive ? "/units/1" : "/units/2")}>
          {isArchive ? "К рабочим" : "К архиву"}
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={columns}
      />
    </div>
  );
}
