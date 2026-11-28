import { useState } from "react";

const TestJoinUs = () => {
  console.log('🟢 TestJoinUs component render/mount');
  
  const [formData, setFormData] = useState({ name: "" });

  const handleChange = (e) => {
    console.log('🟢 Test form change:', e.target.name, '=', e.target.value);
    const { name, value } = e.target;
    
    console.log('🟢 BEFORE setFormData');
    setFormData(prev => {
      console.log('🟢 INSIDE setFormData - Previous:', prev);
      const newData = { ...prev, [name]: value };
      console.log('🟢 INSIDE setFormData - New:', newData);
      return newData;
    });
    console.log('🟢 AFTER setFormData');
  };

  return (
    <div className="min-h-screen p-8">
      <h1>Test Form</h1>
      <form>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="border p-2"
          placeholder="Test input"
        />
      </form>
    </div>
  );
};

export default TestJoinUs;