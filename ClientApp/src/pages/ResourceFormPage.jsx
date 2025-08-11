import React, { useEffect, useState } from "react";
import { Button, Form, Input, Space, message, Popconfirm } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
    getResourceById,
    createResource,
    updateResource,
    deleteResource,
    archiveResource,
    unarchiveResource,
} from "../api/api";

const ZERO = "00000000-0000-0000-0000-000000000000";

export default function ResourceFormPage() {
    const { id } = useParams();
    const isCreate = id === ZERO;
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [isArchived, setIsArchived] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (isCreate) {
                form.setFieldsValue({ name: "" });
                setIsArchived(false);
                return;
            }
            try {
                const r = await getResourceById(id);
                form.setFieldsValue({ name: r?.name ?? "" });
                setIsArchived(Boolean(r?.isArchived ?? r?.IsArchived));
            } catch (e) {
                console.error(e);
                message.error("Не удалось загрузить ресурс");
            }
        };
        load();

    }, [id]);

    const save = async () => {
        try {
            setSaving(true);
            const { name } = await form.validateFields();
            if (isCreate) {
                await createResource({ name });
                message.success("Ресурс создан");
                navigate("/resources/1");
            } else {
                await updateResource(id, { name });
                message.success("Изменения сохранены");
            }
        } catch (e) {
            if (!e?.errorFields) {
                console.error(e);
                message.error(e.message || "Ошибка сохранения");
            }
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        try {
            await deleteResource(id);
            message.success("Ресурс удалён");
            navigate(isArchived ? "/resources/2" : "/resources/1");
        } catch (e) {
            console.error(e);
            message.error("Ошибка удаления");
        }
    };

    const toArchive = async () => {
        try {
            await archiveResource(id);
            setIsArchived(true);
            message.success("В архиве");
            navigate("/resources/2");
        } catch {
            message.error("Ошибка");
        }
    };

    const toWork = async () => {
        try {
            await unarchiveResource(id);
            setIsArchived(false);
            message.success("Вернул в работу");
            navigate("/resources/1");
        } catch {
            message.error("Ошибка");
        }
    };

    return (
        <div>
            <h1>{isCreate ? "Создание ресурса" : "Ресурс"}</h1>
            <Form form={form} layout="vertical" style={{ maxWidth: 480 }}>
                <Form.Item
                    label="Наименование"
                    name="name"
                    rules={[{ required: true, message: "Введите наименование" }]}
                >
                    <Input />
                </Form.Item>

                <Space>
                    <Button type="primary" loading={saving} onClick={save}>
                        Сохранить
                    </Button>

                    {!isCreate && (
                        <Popconfirm
                            title="Удалить ресурс?"
                            okText="Удалить"
                            cancelText="Отмена"
                            onConfirm={onDelete}
                        >
                            <Button danger>Удалить</Button>
                        </Popconfirm>
                    )}

                    {!isCreate &&
                        (!isArchived ? (
                            <Button onClick={toArchive}>В архив</Button>
                        ) : (
                            <Button onClick={toWork}>В работу</Button>
                        ))}
                </Space>
            </Form>
        </div>
    );
}
