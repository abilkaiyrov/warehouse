import React, { useEffect, useState } from "react";
import { Button, DatePicker, Input, Select, Space, Table } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getShipments, getResources, getUnits, getClients } from "../api/api";

const { RangePicker } = DatePicker;

export default function ShipmentsPage() {
    const nav = useNavigate();
    const [rows, setRows] = useState([]);
    const [resources, setResources] = useState([]);
    const [units, setUnits] = useState([]);
    const [clients, setClients] = useState([]);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        getResources().then(setResources);
        getUnits().then(setUnits);
        getClients().then(setClients);
        load();
    }, []);

    const load = async () => {
        const data = await getShipments(filters);
        setRows(data);
    };

    const columns = [
        { title: "Номер", dataIndex: "number" },
        { title: "Дата", dataIndex: "date", render: v => dayjs(v).format("DD.MM.YYYY") },
        { title: "Клиент", dataIndex: ["client", "name"] },
        { title: "Статус", dataIndex: "status", render: s => s === 1 ? "Подписан" : "Не подписан" },
        {
            title: "Ресурс", key: "res",
            render: (_, r) => (
                <>
                    {(r.items || []).map((i, idx) => (
                        <div key={idx}>{i.resource?.name}</div>
                    ))}
                </>
            )
        },
        {
            title: "Ед. изм.", key: "unit",
            render: (_, r) => (
                <>
                    {(r.items || []).map((i, idx) => (
                        <div key={idx}>{i.unit?.name}</div>
                    ))}
                </>
            )
        },
        {
            title: "Количество", key: "qty",
            render: (_, r) => (
                <>
                    {(r.items || []).map((i, idx) => (
                        <div key={idx}>{i.quantity}</div>
                    ))}
                </>
            )
        },
    ];

    return (
        <div>
            <h1>Отгрузки</h1>
            <Space wrap style={{ marginBottom: 12 }}>
                <RangePicker format="DD.MM.YYYY" onChange={(v) => {
                    setFilters(prev => ({
                        ...prev,
                        dateFrom: v?.[0]?.startOf("day")?.toISOString(),
                        dateTo: v?.[1]?.endOf("day")?.toISOString(),
                    }));
                }} />
                <Input placeholder="Номер" onChange={e => setFilters(p => ({ ...p, number: e.target.value }))} />
                <Select placeholder="Клиент" allowClear style={{ width: 200 }}
                    onChange={v => setFilters(p => ({ ...p, clientId: v }))}
                    options={clients.map(c => ({ value: c.id, label: c.name }))} />
                <Select placeholder="Ресурс" allowClear style={{ width: 200 }}
                    onChange={v => setFilters(p => ({ ...p, resourceId: v }))}
                    options={resources.map(r => ({ value: r.id, label: r.name }))} />
                <Select placeholder="Ед. изм." allowClear style={{ width: 200 }}
                    onChange={v => setFilters(p => ({ ...p, unitId: v }))}
                    options={units.map(u => ({ value: u.id, label: u.name }))} />
                <Button type="primary" onClick={load}>Применить</Button>
                <Button onClick={() => nav("/shipments/form/00000000-0000-0000-0000-000000000000")}>Добавить</Button>
            </Space>

            <Table rowKey="id" columns={columns} dataSource={rows}
                onRow={(rec) => ({ onClick: () => nav(`/shipments/form/${rec.id}`) })}
            />
        </div>
    );
}
