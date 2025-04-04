import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getDestinationById, saveDestination, getSavedDestinations, deleteSavedDestination } from "../../api";
import LayoutAuth from "../../components/Layout/AuthLayout";
import { FaArrowLeft, FaBookmark, FaRegBookmark, FaCheck, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../context/UseAuth";

const SingleDestination = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const userId = user?.id;
  const [destination, setDestination] = useState(state?.destination || null);
  const [loading, setLoading] = useState(!state?.destination);
  const [error, setError] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [tempIcon, setTempIcon] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchDestinationData = async () => {
      try {
        if (!destination) {
          const data = await getDestinationById(id);
          setDestination(data);
        }

        if (userId) {
          const savedDestinations = await getSavedDestinations(userId);
          const isBookmarked = savedDestinations.some((item) => item.destination.id === id);
          setBookmarked(isBookmarked);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinationData();
  }, [id, destination, userId]);

  const toggleBookmark = async () => {
    try {
      if (!userId) {
        return;
      }
      
      setBookmarkLoading(true);
      setTempIcon(<FaSpinner className="animate-spin" />);
      
      if (bookmarked) {
        await deleteSavedDestination(userId, destination.id);
        setBookmarked(false);
      } else {
        await saveDestination(userId, destination.id);
        setBookmarked(true);
      }

      setTempIcon(<FaCheck className="text-amber-800 transition-transform duration-200 scale-125" />);
      setTimeout(() => setTempIcon(null), 1000);
    } catch (error) {
      console.error("Gagal mengubah status bookmark:", error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) return <p className="text-amber-800">Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <LayoutAuth>
      <div className="container mx-auto px-6 py-12">
        <button
          className="flex items-center text-amber-800 hover:text-amber-900 mb-6 cursor-pointer"
          onClick={() => window.history.back()}
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <img
            src={destination.imageUrl || "https://placehold.co/600x400"}
            alt={destination.name}
            className="w-full h-80 object-cover rounded-lg shadow-md"
            onError={(e) => (e.target.src = "https://placehold.co/600x400")}
          />
          <div className="text-amber-800">
            <div className="flex justify-between items-center mb-4 relative">
              <h1 className="text-3xl font-bold">{destination.name}</h1>
              <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                {showTooltip && (
                  <div className="absolute -top-12 -right-5 bg-gray-800 text-white text-center text-xs py-1 px-3 rounded shadow-md animate-fadeIn">
                    {bookmarkLoading ? "Memproses" : bookmarked ? "Hapus Simpanan" : "Simpan Destinasi"}
                  </div>
                )}
                <button
                  onClick={toggleBookmark}
                  className="text-2xl cursor-pointer transform transition-transform duration-300 hover:scale-110"
                >
                  {tempIcon || (bookmarked ? <FaBookmark className="text-amber-800" /> : <FaRegBookmark className="text-gray-700" />)}
                </button>
              </div>
            </div>
            <p className="text-lg mb-4">{destination.description}</p>
            <p className="text-gray-700"><strong>Lokasi:</strong> {destination.location}</p>
            <p className="text-gray-700"><strong>Kategori:</strong> {destination.category}</p>
            <p className="text-gray-700"><strong>Rating:</strong> {destination.rating}/5</p>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">Lokasi di Peta</h2>
          {destination.coordinate ? (
            <iframe
              src={`https://www.google.com/maps?q=${destination.coordinate.latitude},${destination.coordinate.longitude}&z=15&output=embed`}
              className="w-full h-64 rounded-lg shadow-md"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          ) : (
            <p className="text-gray-600">Peta tidak tersedia untuk destinasi ini.</p>
          )}
        </div>
      </div>
    </LayoutAuth>
  );
};

export default SingleDestination;