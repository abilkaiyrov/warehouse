import React, { useEffect, useState } from "react";
import { Button, Form, Input, Space, message } from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getClientById, createClient, updateClient, deleteClient, archiveClient, unarchiveClient } from "../api/api";

export default function ClientFormPage() {
    const { id } = useParams();
    const isCreate = id === "00000000-0000-0000-0000-000000000000";
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [isArchived, setIsArchived] = useState(false);

    useEffect(() => {
        if (isCreate) return;
        getClientById(id).then(c => {
            setIsArchived(!!c.isArchived);
            form.setFieldsValue({ name: c.name, address: c.address });
        });
        // eslint-disable-next-line
    }, [id]);

    const save = async () => {
        try {
            const v = await form.validateFields();
            if (isCreate) await createClient(v); else await updateClient(id, v);
            message.success("Сохранено");
            navigate(isArchived ? "/clients/2" : "/clients/1");
        } catch { message.error("Ошибка сохранения"); }
    };

    const onDelete = async () => {
        try { await deleteClient(id); message.success("Удалено"); navigate("/clients/1"); }
        catch { message.error("Ошибка удаления"); }
    };

    const toArchive = async () => {
        try { await archiveClient(id); message.success("В архиве"); navigate("/clients/2"); }
        catch { message.error("Ошибка"); }
    };
    const toWork = async () => {
        try { await unarchiveClient(id); message.success("Вернул в работу"); navigate("/clients/1"); }
        catch { message.error("Ошибка"); }
    };

    return (
        <div>
            <h1>{isCreate ? "Создание клиента" : "Клиент"}</h1>
            <Form form={form} layout="vertical" style={{ maxWidth: 480 }}>
                <Form.Item label="Наименование" name="name" rules={[{ required: true, message: "Введите наименование" }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Адрес" name="address" rules={[{ required: true, message: "Введите адрес" }]}>
                    <Input />
                </Form.Item>
                <Space>
                    <Button type="primary" onClick={save}>Сохранить</Button>
                    {!isCreate && <Button danger onClick={onDelete}>Удалить</Button>}
                    {!isCreate && (!isArchived
                        ? <Button onClick={toArchive}>В архив</Button>
                        : <Button onClick={toWork}>В работу</Button>
                    )}
                </Space>
            </Form>
        </div>
    );
}
