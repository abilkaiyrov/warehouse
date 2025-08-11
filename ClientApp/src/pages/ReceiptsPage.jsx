import React, { useEffect, useState } from "react";
import { Button, DatePicker, Input, Select, Space, Table, message } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { getReceipts, getResources, getUnits } from "../api/api";

const { RangePicker } = DatePicker;

export default function ReceiptsPage() {
    const nav = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [resources, setResources] = useState([]);
    const [units, setUnits] = useState([]);
    const [filters, setFilters] = useState({
        number: "",
        resourceId: undefined,
        unitId: undefined,
        period: null,
    });

    const load = async () => {
        try {
            const params = {
                number: filters.number?.trim(),
                resourceId: filters.resourceId,
                unitId: filters.unitId,
            };

            if (filters.period && filters.period.length === 2) {
                params.dateFrom = filters.period[0]?.startOf("day").toISOString();
                params.dateTo = filters.period[1]?.endOf("day").toISOString();
            }

            const list = await getReceipts(params);
            setReceipts(list);
        } catch (e) {
            console.error(e);
            message.error(e.message || "Ошибка при получении поступлений");
        }
    };

    useEffect(() => {
        getResources().then(setResources).catch(() => { });
        getUnits().then(setUnits).catch(() => { });
        load();
        
    }, []);

    const columns = [
        { title: "Номер", dataIndex: "number" },
        { title: "Дата", dataIndex: "date", render: v => dayjs(v).format("DD.MM.YYYY") },
        {
            title: "Ресурс",
            key: "res",
            render: (_, r) => (
                <>
                    {(r.items || []).map((i, idx) => <div key={idx}>{i.resource?.name}</div>)}
                </>
            )
        },
        {
            title: "Ед. изм.",
            key: "unit",
            render: (_, r) => (
                <>
                    {(r.items || []).map((i, idx) => <div key={idx}>{i.unit?.name}</div>)}
                </>
            )
        },
        {
            title: "Количество",
            key: "qty",
            render: (_, r) => (
                <>
                    {(r.items || []).map((i, idx) => <div key={idx}>{i.quantity}</div>)}
                </>
            )
        },
    ];

    return (
        <div>
            <h1>Поступления</h1>

            <Space style={{ marginBottom: 12 }} wrap>
                <Input
                    placeholder="Номер"
                    value={filters.number}
                    onChange={(e) => setFilters({ ...filters, number: e.target.value })}
                    style={{ width: 180 }}
                />
                <Select
                    allowClear
                    placeholder="Ресурс"
                    style={{ width: 200 }}
                    value={filters.resourceId}
                    onChange={(v) => setFilters({ ...filters, resourceId: v })}
                    options={resources.map(r => ({ value: r.id, label: r.name }))}
                />
                <Select
                    allowClear
                    placeholder="Ед. изм."
                    style={{ width: 180 }}
                    value={filters.unitId}
                    onChange={(v) => setFilters({ ...filters, unitId: v })}
                    options={units.map(u => ({ value: u.id, label: u.name }))}
                />
                <RangePicker
                    format="DD.MM.YYYY"
                    value={filters.period}
                    onChange={(v) => setFilters({ ...filters, period: v })}
                />
                <Button type="primary" onClick={load}>Применить</Button>
                <Button onClick={() => nav("/receipts/form/00000000-0000-0000-0000-000000000000")}>
                    Добавить
                </Button>
            </Space>

            <Table
                rowKey="id"
                dataSource={receipts}
                columns={columns}
                onRow={(r) => ({ onClick: () => nav(`/receipts/${r.id}`) })}
            />
        </div>
    );
}
