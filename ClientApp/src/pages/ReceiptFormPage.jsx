import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Button,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
    getResources,
    getUnits,
    createReceipt,
    getReceiptById,
    updateReceipt,
} from "../api/api";

const ReceiptFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [resources, setResources] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        getResources().then(setResources);
        getUnits().then(setUnits);

        if (id !== "00000000-0000-0000-0000-000000000000") {
            getReceiptById(id).then((receipt) => {
                form.setFieldsValue({
                    number: receipt.number,
                    date: dayjs(receipt.date),
                    items: receipt.items.map((item) => ({
                        resourceId: item.resourceId,
                        unitId: item.unitId,
                        quantity: item.quantity,
                    })),
                });
            });
        }
    }, [id, form]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const payload = {
                number: values.number,
                date: values.date.toISOString(),
                items: values.items.map((item) => ({
                    resourceId: item.resourceId,
                    unitId: item.unitId,
                    quantity: item.quantity,
                })),
            };

            if (id === "00000000-0000-0000-0000-000000000000") {
                await createReceipt(payload);
                message.success("Поступление успешно создано");
            } else {
                await updateReceipt(id, payload);
                message.success("Поступление успешно обновлено");
            }

            navigate("/receipts/1");
        } catch (error) {
            console.error(error);
            message.error("Ошибка при сохранении поступления");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>{id === "00000000-0000-0000-0000-000000000000" ? "Создание" : "Редактирование"} поступления</h1>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    date: dayjs(),
                    items: [{ resourceId: null, unitId: null, quantity: null }],
                }}
            >
                <Form.Item
                    label="Номер поступления"
                    name="number"
                    rules={[{ required: true, message: "Введите номер поступления" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Дата"
                    name="date"
                    rules={[{ required: true, message: "Выберите дату" }]}
                >
                    <DatePicker format="DD.MM.YYYY" />
                </Form.Item>

                <Form.List name="items">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space
                                    key={key}
                                    style={{ display: "flex", marginBottom: 8 }}
                                    align="baseline"
                                >
                                    <Form.Item
                                        {...restField}
                                        name={[name, "resourceId"]}
                                        rules={[{ required: true, message: "Выберите ресурс" }]}
                                    >
                                        <Select
                                            style={{ width: 200 }}
                                            placeholder="Ресурс"
                                            options={resources.map((r) => ({
                                                value: r.id,
                                                label: r.name,
                                            }))}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        {...restField}
                                        name={[name, "unitId"]}
                                        rules={[{ required: true, message: "Единица" }]}
                                    >
                                        <Select
                                            style={{ width: 150 }}
                                            placeholder="Ед. изм."
                                            options={units.map((u) => ({
                                                value: u.id,
                                                label: u.name,
                                            }))}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        {...restField}
                                        name={[name, "quantity"]}
                                        rules={[{ required: true, message: "Введите количество" }]}
                                    >
                                        <InputNumber min={0.01} step={0.01} />
                                    </Form.Item>

                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}

                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    icon={<PlusOutlined />}
                                >
                                    Добавить позицию
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Сохранить
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ReceiptFormPage;