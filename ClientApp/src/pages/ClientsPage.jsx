import React, { useEffect, useState } from "react";
import { Button, Table, Space, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { getClients } from "../api/api";

export default function ClientsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const isArchive = location.pathname.endsWith("/2");

    const [rows, setRows] = useState([]);

    const load = async () => {
        try {
            const data = await getClients(isArchive);
            setRows(data);
        } catch { message.error("Не удалось загрузить клиентов"); }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [isArchive]);

    const columns = [
        {
            title: "Наименование",
            dataIndex: "name",
            render: (_, r) => (
                <a onClick={() => navigate(`/clients/form/${r.id}`)}>{r.name}</a>
            )
        },
        { title: "Адрес", dataIndex: "address" }
    ];

    return (
        <div>
            <h1>Клиенты {isArchive ? "(архив)" : ""}</h1>
            <Space style={{ marginBottom: 12 }}>
                {!isArchive ? (
                    <>
                        <Button type="primary" onClick={() => navigate("/clients/form/00000000-0000-0000-0000-000000000000")}>
                            Добавить
                        </Button>
                        <Button onClick={() => navigate("/clients/2")}>К архиву</Button>
                    </>
                ) : (
                    <Button onClick={() => navigate("/clients/1")}>К рабочим</Button>
                )}
            </Space>

            <Table rowKey="id" dataSource={rows} columns={columns} />
        </div>
    );
}
