import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaTrash } from "react-icons/fa";

const ImagesList = () => {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState("");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pageNumbers = [...Array(pages + 1).keys()].slice(1);

  const fetchImages = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND}/api/images?page=${page}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(({ data }) => {
        setImages(data.results || []);
        setPages(data.totalPages || 1);
        setHasNextPage(data.hasNextPage || false);
        setHasPreviousPage(data.hasPreviousPage || false);
      })
      .catch(() => {
        toast.error("Error fetching images");
      });
  };

  const fetchGalleries = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND}/api/galleries`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(({ data }) => {
        setGalleries(data.results || []);
      })
      .catch(() => {
        toast.error("Error fetching galleries");
      });
  };

  const handleDeleteImage = (imageId) => {
    axios
      .delete(`${import.meta.env.VITE_BACKEND}/api/images/${imageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        toast.success("Image deleted successfully");
        fetchImages();
      })
      .catch(() => {
        toast.error("Failed to delete image");
      });
  };

  const handleSelectImage = (imageId) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    const allSelected = images.length === selectedImages.length;
    setSelectedImages(allSelected ? [] : images.map((image) => image.id));
  };

  const handleAddToGallery = () => {
    if (selectedImages.length === 0) {
      toast.warning("Please select images to add to a gallery");
      return;
    }
    setShowGalleryModal(true);
    fetchGalleries();
  };

  const handleConfirmAddToGallery = () => {
    if (!selectedGallery) {
      toast.warning("Please select a gallery");
      return;
    }
  
    const galleryId = Number(selectedGallery);
  
    const galleryToUpdate = galleries.find(
      (gallery) => gallery.id === galleryId
    );
  
    if (!galleryToUpdate) {
      toast.warning("Selected gallery not found");
      return;
    }
  
    if (!Array.isArray(galleryToUpdate.Images)) {
      galleryToUpdate.Images = [];
    }
  
    const newImages = selectedImages.filter((imageId) => {
      const imageExists = galleryToUpdate.Images.find((image) => image.id === imageId);
      if (imageExists) {
        toast.info(`Image with ID ${imageId} is already in the gallery`);
      }
      return !imageExists;
    });
  
    if (newImages.length === 0) {
      toast.info("No new images to add to the gallery");
      return;
    }
  
    newImages.forEach((imageId) => {
      galleryToUpdate.Images.push({ id: imageId });
    });
  
    axios
      .put(
        `${import.meta.env.VITE_BACKEND}/api/galleries/${galleryId}`,
        galleryToUpdate,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        toast.success("Images added to gallery successfully!");
        setShowGalleryModal(false);
        setSelectedImages([]);
        fetchGalleries();
      })
      .catch(() => {
        toast.error("Failed to add images to gallery");
      });
  };

  const handleImageChange = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleSubmitImage = async (e) => {
    e.preventDefault();
    if (!newImage) {
      toast.warning("Please select an image to upload.");
      return;
    }

    try {
      setLoading(true);
      const imageData = new FormData();
      imageData.append("image", newImage);
      imageData.append("name", newImage.name);

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND}/api/file/upload`,
        imageData,
        config
      );

      toast.success("Image uploaded successfully!");

      fetchImages();

      document.getElementById("file-upload").value = null;
      setNewImage(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page]);

  useEffect(() => {
    fetchGalleries();
  }, []);

  return (
    <section className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4 p-4">
      <div className="flex justify-start w-full max-w-4xl gap-4 flex-col sm:flex-row sm:items-center">
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={handleAddToGallery}
        >
          <FaPlus /> Add to Gallery
        </button>
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          <input
            type="file"
            onChange={handleImageChange}
            className="file-input file-input-secondary w-full sm:max-w-xs rounded-none"
            id="file-upload"
          />
          <button
            onClick={handleSubmitImage}
            className="btn btn-secondary flex items-center gap-2  sm:max-w-xs"
            disabled={loading || !newImage}
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </div>
      </div>

      <table className="table sm:table-xs table-zebra w-full max-w-4xl"> 
        <thead className="bg-secondary text-white">
          <tr>
            <th>Thumbnail</th>
            <th>Name</th>
            <th>Actions</th>
            <th>
              <input
                type="checkbox"
                className="checkbox"
                onChange={handleSelectAll}
                checked={
                  images.length > 0 && selectedImages.length === images.length
                }
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {images.map((image) => (
            <tr key={image.id}>
              <td>
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </td>
              <td className="font-bold">{image.name}</td>
              <td>
                <button
                  className="btn btn-ghost btn-sm flex items-center gap-1"
                  onClick={() => handleDeleteImage(image.id)}
                >
                  <FaTrash /> löschen
                </button>
              </td>
              <td>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectedImages.includes(image.id)}
                  onChange={() => handleSelectImage(image.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="join mt-4">
        <button
          className={
            hasPreviousPage ? "join-item btn" : "join-item btn btn-disabled"
          }
          onClick={() => setPage(page - 1)}
        >
          «
        </button>
        {pages &&
          pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              className={
                page === pageNumber
                  ? "join-item btn btn-active"
                  : "join-item btn"
              }
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        <button
          className={
            hasNextPage ? "join-item btn" : "join-item btn btn-disabled"
          }
          onClick={() => setPage(page + 1)}
        >
          »
        </button>
      </div>

      {showGalleryModal && (
        <section className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Select a Gallery</h3>
            <select
              className="select select-bordered w-full mt-4"
              value={selectedGallery}
              onChange={(e) => setSelectedGallery(e.target.value)}
            >
              <option value="">-- Select a Gallery --</option>
              {galleries.map((gallery) => (
                <option key={gallery.id} value={gallery.id}>
                  {gallery.title}
                </option>
              ))}
            </select>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleConfirmAddToGallery}
              >
                Confirm
              </button>
              <button
                className="btn"
                onClick={() => setShowGalleryModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      )}
    </section>
  );
};

export default ImagesList;
