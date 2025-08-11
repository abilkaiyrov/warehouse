import React, { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, InputNumber, Select, Space, Table, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
    getShipmentById,
    createShipment,
    updateShipment,
    deleteShipment,
    signShipment,
    revokeShipment,
    getClients,
    getAvailability,
} from "../api/api";

const ZERO = "00000000-0000-0000-0000-000000000000";

export default function ShipmentFormPage() {
    const { id } = useParams();
    const isCreate = id === ZERO;
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [clients, setClients] = useState([]);
    const [status, setStatus] = useState(0);
    const [loading, setLoading] = useState(false);

    const [stock, setStock] = useState([]);

    const readOnly = !isCreate && status === 1;

    useEffect(() => {

        getClients().then(setClients).catch(() => { });

        getAvailability()
            .then((rows) => {
                const base = rows.map((r) => ({ ...r, qty: 0 }));
                setStock(base);

                if (isCreate) {
                    form.setFieldsValue({ date: dayjs() });
                    return;
                }

                getShipmentById(id)
                    .then((s) => {
                        setStatus(s.status);
                        form.setFieldsValue({
                            number: s.number,
                            date: dayjs(s.date),
                            clientId: s.clientId,
                        });

                        const qtyMap = new Map(
                            (s.items || []).map((i) => [
                                `${i.resourceId}_${i.unitId}`,
                                Number(i.quantity) || 0,
                            ])
                        );

                        setStock((prev) =>
                            prev.map((r) => {
                                const key = `${r.resourceId}_${r.unitId}`;
                                let q = qtyMap.has(key) ? Number(qtyMap.get(key)) : 0;
                                const av = Number(r.available) || 0;
                                if (q > av) q = av;
                                if (q < 0) q = 0;
                                return { ...r, qty: q };
                            })
                        );
                    })
                    .catch(() => message.error("Не удалось загрузить отгрузку"));
            })
            .catch(() => message.error("Не удалось загрузить доступные остатки"));
        
    }, [id]);

    const clampQty = (val, available) => {
        const v = Number(val ?? 0);
        const av = Number(available ?? 0);
        if (!Number.isFinite(v)) return 0;
        return Math.max(0, Math.min(v, av));
    };

    const columns = [
        { title: "Ресурс", dataIndex: "resourceName", key: "resourceName" },
        { title: "Ед. изм.", dataIndex: "unitName", key: "unitName" },
        { title: "Доступно", dataIndex: "available", key: "available" },
        {
            title: "Количество",
            key: "qty",
            render: (_, row, index) => (
                <InputNumber
                    min={0}
                    step={0.01}
                    disabled={readOnly}
                    value={row.qty}
                    onChange={(val) => {
                        setStock((s) => {
                            const copy = [...s];
                            const clamped = clampQty(val, copy[index].available);
                            if (clamped !== copy[index].qty) {
                                copy[index] = { ...copy[index], qty: clamped };
                            } else {
                                copy[index] = { ...copy[index], qty: clamped };
                            }
                            return copy;
                        });
                    }}
                    onBlur={() => {
                        setStock((s) => {
                            const copy = [...s];
                            const clamped = clampQty(copy[index].qty, copy[index].available);
                            copy[index] = { ...copy[index], qty: clamped };
                            return copy;
                        });
                    }}
                />
            ),
        },
    ];

    const buildPayload = (values) => {
        const normalized = stock.map((r) => ({
            ...r,
            qty: clampQty(r.qty, r.available),
        }));

        return {
            number: values.number,
            date: values.date?.toISOString(),
            clientId: values.clientId,
            status,
            items: normalized
                .filter((r) => (Number(r.qty) || 0) > 0)
                .map((r) => ({
                    resourceId: r.resourceId,
                    unitId: r.unitId,
                    quantity: Number(r.qty),
                })),
        };
    };

    const handleSave = async (signAfter = false) => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const payload = buildPayload(values);

            if (!payload.items.length) {
                message.warning("Добавьте хотя бы одну позицию с количеством > 0");
                return;
            }

            if (isCreate) {
                const created = await createShipment(payload);
                if (signAfter) await signShipment(created.id);
            } else {
                await updateShipment(id, payload);
                if (signAfter) await signShipment(id);
            }

            message.success(signAfter ? "Сохранено и подписано" : "Сохранено");
            navigate("/shipments");
        } catch (e) {
            if (e?.errorFields) return;
            console.error(e);
            message.error("Ошибка сохранения");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteShipment(id);
            message.success("Отгрузка удалена");
            navigate("/shipments");
        } catch (e) {
            console.error(e);
            message.error("Ошибка удаления");
        }
    };

    const handleRevoke = async () => {
        try {
            await revokeShipment(id);
            setStatus(0);
            message.success("Подпись отозвана");
        } catch (e) {
            console.error(e);
            message.error("Не удалось отозвать подпись");
        }
    };

    return (
        <div>
            <h1>{isCreate ? "Создание отгрузки" : "Редактирование отгрузки"}</h1>

            <Form form={form} layout="vertical">
                <Form.Item
                    label="Номер"
                    name="number"
                    rules={[{ required: true, message: "Введите номер" }]}
                >
                    <Input disabled={readOnly} />
                </Form.Item>

                <Form.Item
                    label="Дата"
                    name="date"
                    rules={[{ required: true, message: "Выберите дату" }]}
                >
                    <DatePicker format="DD.MM.YYYY" disabled={readOnly} />
                </Form.Item>

                <Form.Item
                    label="Клиент"
                    name="clientId"
                    rules={[{ required: true, message: "Выберите клиента" }]}
                >
                    <Select
                        disabled={readOnly}
                        options={clients.map((c) => ({ value: c.id, label: c.name }))}
                    />
                </Form.Item>

                <h3>Позиции (все из поступлений)</h3>
                <Table
                    rowKey={(r) => `${r.resourceId}_${r.unitId}`}
                    dataSource={stock}
                    columns={columns}
                    size="small"
                    pagination={false}
                />
            </Form>

            <Space style={{ marginTop: 12 }}>
                {!isCreate && readOnly && (
                    <Button onClick={handleRevoke}>Отозвать</Button>
                )}

                {!readOnly && (
                    <>
                        <Button type="primary" loading={loading} onClick={() => handleSave(false)}>
                            Сохранить
                        </Button>
                        <Button loading={loading} onClick={() => handleSave(true)}>
                            Сохранить и подписать
                        </Button>
                    </>
                )}

                {!isCreate && !readOnly && (
                    <Button danger onClick={handleDelete}>
                        Удалить
                    </Button>
                )}
            </Space>
        </div>
    );
}
