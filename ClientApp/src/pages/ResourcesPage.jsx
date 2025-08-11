import React, { useEffect, useState } from "react";
import { Button, Table, Space } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { getResources, getArchivedResources } from "../api/api";

export default function ResourcesPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const isArchive = location.pathname.endsWith("/2");

    const [data, setData] = useState([]);
    const load = async () => {
        const rows = isArchive ? await getArchivedResources() : await getResources();
        setData(rows);
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [isArchive]);

    const columns = [
        {
            title: "Наименование",
            dataIndex: "name",
            render: (_, r) => (
                <a onClick={() => navigate(`/resources/${r.id}${isArchive ? "?arch=1" : ""}`)}>
                    {r.name}
                </a>
            ),
        },
    ];

    return (
        <div>
            <h1>Ресурсы {isArchive ? "(архив)" : ""}</h1>
            <Space style={{ marginBottom: 12 }}>
                {!isArchive && (
                    <Button type="primary" onClick={() => navigate("/resources/form/00000000-0000-0000-0000-000000000000")}>
                        Добавить
                    </Button>
                )}
                <Button onClick={() => navigate(isArchive ? "/resources/1" : "/resources/2")}>
                    {isArchive ? "К рабочим" : "К архиву"}
                </Button>
            </Space>
            <Table rowKey="id" dataSource={data} columns={columns} />
        </div>
    );
}
