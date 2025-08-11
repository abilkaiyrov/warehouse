
import React, { useState, useEffect } from "react";
import { Input, Form } from "antd";

const ResourceForm = ({ resource = {}, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(resource);
  }, [resource]);

  const handleFinish = async (values) => {
    console.log("Saving:", values);
    onSubmit();
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="vertical">
      <Form.Item label="Наименование" name="name" rules={[{ required: true, message: "Введите наименование" }]}>
        <Input />
      </Form.Item>
    </Form>
  );
};

export default ResourceForm;
