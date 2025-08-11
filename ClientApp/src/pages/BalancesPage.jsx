import React, { useEffect, useState } from "react";
import { Table, Select, Button, Space, message } from "antd";
import { getBalances, getResources, getUnits } from "../api/api";

export default function BalancesPage() {
    const [rows, setRows] = useState([]);
    const [resources, setResources] = useState([]);
    const [units, setUnits] = useState([]);
    const [filters, setFilters] = useState({ resourceId: null, unitId: null });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getResources().then(setResources).catch(() => { });
        getUnits().then(setUnits).catch(() => { });
        load();
        // eslint-disable-next-line
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const data = await getBalances({
                resourceId: filters.resourceId || undefined,
                unitId: filters.unitId || undefined,
            });
            setRows(data);
        } catch (e) {
            console.error(e);
            message.error("Не удалось получить баланс");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: "Ресурс", dataIndex: "resourceName", key: "resourceName" },
        { title: "Единица измерения", dataIndex: "unitName", key: "unitName" },
        { title: "Количество", dataIndex: "quantity", key: "quantity" },
    ];

    return (
        <div>
            <h1>Баланс</h1>
            <Space style={{ marginBottom: 12 }}>
                <Select
                    allowClear
                    style={{ width: 220 }}
                    placeholder="Ресурс"
                    options={resources.map(r => ({ value: r.id, label: r.name }))}
                    onChange={(v) => setFilters(f => ({ ...f, resourceId: v || null }))}
                />
                <Select
                    allowClear
                    style={{ width: 220 }}
                    placeholder="Ед. изм."
                    options={units.map(u => ({ value: u.id, label: u.name }))}
                    onChange={(v) => setFilters(f => ({ ...f, unitId: v || null }))}
                />
                <Button type="primary" onClick={load}>Применить</Button>
            </Space>

            <Table
                rowKey={(r) => `${r.resourceId}-${r.unitId}`}
                dataSource={rows}
                columns={columns}
                loading={loading}
                pagination={false}
            />
        </div>
    );
}
