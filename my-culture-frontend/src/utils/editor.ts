export async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name);

    const response = await fetch(import.meta.env.VITE_BACKEND + '/api/file/upload', {
        method: "POST",
        body: formData,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
    });

    return (await response.json()).url;
}