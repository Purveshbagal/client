import { useNavigate } from 'react-router-dom';

const CategorySection = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: 'Veg',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
      description: 'Pure vegetarian dishes'
    },
    {
      id: 2,
      name: 'Non Veg',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
      description: 'Delicious non-veg meals'
    },
    {
      id: 3,
      name: 'Chinese',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop',
      description: 'Chinese cuisine'
    },
    {
      id: 4,
      name: 'Vada Pav',
      image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=400&fit=crop',
      description: 'Mumbai special'
    },
    {
      id: 5,
      name: 'Thali',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
      description: 'Complete meal platter'
    },
    {
      id: 6,
      name: 'Biryani',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=400&fit=crop',
      description: 'Aromatic rice dishes'
    },
    {
      id: 7,
      name: 'Pizza',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop',
      description: 'Italian favorites'
    }
  ];

  const handleCategoryClick = (categoryName) => {
    // Navigate to category dishes page
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="bg-white py-6 md:py-8 px-4">
      <div className="container mx-auto">
        <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 text-center md:text-left">
          What's on your mind?
        </h2>
        
        {/* Horizontal scrollable category list */}
        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide snap-x snap-mandatory">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              className="flex-shrink-0 cursor-pointer group snap-start"
            >
              <div className="w-24 md:w-32 text-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-2 border-4 border-transparent group-hover:border-orange-400 transition-all duration-300 transform group-hover:scale-105 shadow-lg">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors text-sm md:text-base">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CategorySection;
