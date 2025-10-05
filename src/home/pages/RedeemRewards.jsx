import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { database } from '../../firebase/config';
import { ref, onValue, update } from 'firebase/database';
import { logRewardRedemption } from '../../firebase/activities';
import { 
  Gift,
  Search,
  Filter,
  Star,
  ShoppingCart,
  Tag,
  Package,
  AlertCircle,
  CheckCircle,
  Heart,
  Zap,
  Award
} from 'lucide-react';
import { HomeNavbar, HomeFooter } from '../components';
import '../css/RedeemRewards.css';

// Constants - Easy to maintain and edit
const REWARDS_OVERVIEW = {
  title: "Choose Your Rewards",
  subtitle: "Redeem your hard-earned points for amazing eco-friendly products",
  tagline: "All products are sustainably sourced"
};

const FILTER_OPTIONS = {
  categories: [
    { value: 'all', label: 'All Categories' }
  ],
  priceRanges: [
    { value: 'all', label: 'All Prices' },
    { value: 'low', label: 'Under 50 pts', min: 0, max: 50 },
    { value: 'medium', label: '50-200 pts', min: 50, max: 200 },
    { value: 'high', label: '200+ pts', min: 200, max: Infinity }
  ]
};

const NO_PRODUCTS_MESSAGES = {
  noResults: "No rewards found",
  tryAdjusting: "Try adjusting your filters",
  checkBack: "Check back later for new rewards!"
};

const MODAL_CONTENT = {
  title: "Confirm Redemption",
  currentBalance: "Your current balance:",
  afterRedemption: "After redemption:",
  cancel: "Cancel",
  confirm: "Confirm Redemption"
};

const RedeemRewards = () => {
  const { user, updateUserPoints } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [favoriteProducts, setFavoriteProducts] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  // Fetch products from Firebase
  useEffect(() => {
    const productsRef = ref(database, 'Products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const productsList = Object.keys(data).map(productID => ({
          productID,
          ...data[productID]
        }))
        .filter(product => product.isActive); // Only show active products
        setProducts(productsList);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Memoized calculations
  const rewardCalculations = useMemo(() => {
    const availableBalance = user?.points || 0;
    const availableRewards = products.length;
    const affordableItems = products.filter(p => (p.pointsRequired || 0) <= availableBalance).length;
    const favoriteCount = favoriteProducts.size;

    return {
      availableBalance,
      availableRewards,
      affordableItems,
      favoriteCount
    };
  }, [user?.points, products, favoriteProducts]);

  // Memoized reward stats
  const rewardStats = useMemo(() => [
    {
      id: 'balance',
      title: 'Available Balance',
      value: rewardCalculations.availableBalance,
      icon: Star,
      color: 'primary',
      suffix: 'pts'
    },
    {
      id: 'rewards',
      title: 'Available Rewards',
      value: rewardCalculations.availableRewards,
      icon: Gift,
      color: 'secondary',
      suffix: 'items'
    },
    {
      id: 'affordable',
      title: 'Affordable Items',
      value: rewardCalculations.affordableItems,
      icon: CheckCircle,
      color: 'accent',
      suffix: 'items'
    },
    {
      id: 'favorites',
      title: 'Favorites',
      value: rewardCalculations.favoriteCount,
      icon: Heart,
      color: 'primary',
      suffix: 'saved'
    }
  ], [rewardCalculations]);

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return [
      ...FILTER_OPTIONS.categories,
      ...categories.map(cat => ({ value: cat, label: cat }))
    ];
  }, [products]);

  // Filter products based on search, category, and price
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch = (product.name && product.name.toLowerCase().includes(searchTermLower)) ||
                           (product.description && product.description.toLowerCase().includes(searchTermLower));
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      let matchesPrice = true;
      if (priceFilter !== 'all') {
        const points = product.pointsRequired || 0;
        const priceRange = FILTER_OPTIONS.priceRanges.find(range => range.value === priceFilter);
        if (priceRange) {
          matchesPrice = points >= priceRange.min && points <= priceRange.max;
        }
      }
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, priceFilter]);

  // Utility functions
  const canAfford = (pointsRequired) => {
    return (user?.points || 0) >= pointsRequired;
  };

  // Event handlers
  const handlers = useMemo(() => ({
    updateSearchTerm: (term) => setSearchTerm(term),
    updateCategoryFilter: (category) => setSelectedCategory(category),
    updatePriceFilter: (price) => setPriceFilter(price),
    toggleFavorite: (productId) => {
      const newFavorites = new Set(favoriteProducts);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      setFavoriteProducts(newFavorites);
    },
    openRedeemModal: (product) => {
      setSelectedProduct(product);
      setShowRedeemModal(true);
    },
    closeRedeemModal: () => {
      setShowRedeemModal(false);
      setSelectedProduct(null);
    },
    confirmRedeem: async () => {
      if (!selectedProduct || !user?.userID) return;

      const currentUserPoints = user?.points || 0;
      const pointsRequired = selectedProduct.pointsRequired || 0;

      // Check if user has enough points
      if (currentUserPoints < pointsRequired) {
        alert(`Insufficient points! You need ${pointsRequired - currentUserPoints} more points.`);
        return;
      }

      try {
        // First, deduct points from user's account
        const newPointsBalance = currentUserPoints - pointsRequired;
        const userRef = ref(database, `Users/${user.userID}`);
        
        await update(userRef, {
          points: newPointsBalance,
          updatedAt: new Date().toISOString()
        });

        // Update user points in the auth context immediately
        updateUserPoints(newPointsBalance);

        // Then log the reward redemption activity to Firebase
        await logRewardRedemption(
          user.userID,
          selectedProduct.name,
          pointsRequired,
          {
            productID: selectedProduct.productID,
            category: selectedProduct.category,
            description: selectedProduct.description,
            pointsBeforeRedemption: currentUserPoints,
            pointsAfterRedemption: newPointsBalance
          }
        );

        alert(`Successfully redeemed ${selectedProduct.name}! Points deducted: ${pointsRequired}. New balance: ${newPointsBalance} points.`);
        setShowRedeemModal(false);
        setSelectedProduct(null);
      } catch (error) {
        console.error('Error processing reward redemption:', error);
        
        // Provide more specific error messages
        if (error.message && error.message.includes('permission')) {
          alert('Permission denied. Please check your account status.');
        } else if (error.message && error.message.includes('network')) {
          alert('Network error. Please check your connection and try again.');
        } else {
          alert('Error processing redemption. Please try again.');
        }
        
        // Don't close modal on error so user can retry
      }
    }
  }), [favoriteProducts, selectedProduct, user?.userID]);

  // Sub-components for better organization
  const RewardsOverviewSection = () => (
    <section className="welcome-section">
      <div className="welcome-content">
        <h2 className="welcome-title">
          Choose Your <span className="highlight">Rewards</span>
        </h2>
        <p className="welcome-subtitle">
          {REWARDS_OVERVIEW.subtitle}
        </p>
        <div className="location-info">
          <Award className="location-icon" />
          <span>{REWARDS_OVERVIEW.tagline}</span>
        </div>
      </div>
      <div className="welcome-image">
        <div className="recycling-illustration">
          <ShoppingCart className="illustration-icon" />
        </div>
      </div>
    </section>
  );

  {/* const RewardStatsSection = () => (
    <section className="stats-section">
      <h3 className="section-title">Reward Statistics</h3>
      <div className="stats-grid">
        {rewardStats.map((stat) => (
          <RewardStatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
  */}

  const RewardStatCard = ({ stat }) => (
    <div className={`stat-card stat-${stat.color}`}>
      <div className="stat-icon-container">
        <stat.icon className="stat-icon" />
      </div>
      <div className="stat-content">
        <h4 className="stat-value">
          {stat.value}{stat.suffix || ''}
        </h4>
        <p className="stat-title">{stat.title}</p>
      </div>
    </div>
  );

  const FiltersSection = () => (
    <section className="filters-section">
      <div className="filters-header">
        <h3 className="section-title">Find Your Perfect Reward</h3>
        <div className="filters-container">
          <SearchFilter />
          <CategoryFilter />
          <PriceFilter />
        </div>
      </div>
    </section>
  );

  const SearchFilter = () => (
    <div className="search-filter">
      <Search className="search-icon" />
      <input
        type="text"
        placeholder="Search rewards..."
        value={searchTerm}
        onChange={(e) => handlers.updateSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>
  );

  const CategoryFilter = () => (
    <div className="category-filter">
      <Filter className="filter-icon" />
      <select
        value={selectedCategory}
        onChange={(e) => handlers.updateCategoryFilter(e.target.value)}
        className="filter-select"
      >
        {availableCategories.map(category => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );

  const PriceFilter = () => (
    <div className="price-filter">
      <Star className="filter-icon" />
      <select
        value={priceFilter}
        onChange={(e) => handlers.updatePriceFilter(e.target.value)}
        className="filter-select"
      >
        {FILTER_OPTIONS.priceRanges.map(range => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );

  const ProductsSection = () => (
    <section className="products-section">
      <h3 className="section-title">
        Available Rewards ({filteredProducts.length})
      </h3>
      
      {filteredProducts.length === 0 ? (
        <NoProductsMessage />
      ) : (
        <ProductsGrid />
      )}
    </section>
  );

  const NoProductsMessage = () => (
    <div className="no-products">
      <Package className="no-products-icon" />
      <p>{NO_PRODUCTS_MESSAGES.noResults}</p>
      <small>
        {searchTerm || selectedCategory !== 'all' || priceFilter !== 'all' 
          ? NO_PRODUCTS_MESSAGES.tryAdjusting
          : NO_PRODUCTS_MESSAGES.checkBack}
      </small>
    </div>
  );

  const ProductsGrid = () => (
    <div className="products-grid">
      {filteredProducts.map(product => (
        <ProductCard 
          key={product.productID} 
          product={product} 
          isFavorite={favoriteProducts.has(product.productID)}
          onToggleFavorite={handlers.toggleFavorite}
          onRedeem={handlers.openRedeemModal}
          canAfford={canAfford(product.pointsRequired || 0)}
        />
      ))}
    </div>
  );

  const ProductCard = ({ product, isFavorite, onToggleFavorite, onRedeem, canAfford: isAffordable }) => (
    <div className="product-card">
      <ProductImage product={product} />
      <ProductBadges 
        product={product} 
        isFavorite={isFavorite} 
        onToggleFavorite={onToggleFavorite} 
      />
      <ProductInfo 
        product={product} 
        isAffordable={isAffordable} 
        onRedeem={onRedeem} 
        userPoints={user?.points || 0}
      />
    </div>
  );

  const ProductImage = ({ product }) => (
    <div className="product-image">
      {product.image ? (
        <img src={product.image} alt={product.name} />
      ) : (
        <div className="placeholder-image">
          <Package className="placeholder-icon" />
          <small>No Image</small>
        </div>
      )}
      {product.stock === 0 && (
        <div className="out-of-stock-overlay">
          <span>Out of Stock</span>
        </div>
      )}
    </div>
  );

  const ProductBadges = ({ product, isFavorite, onToggleFavorite }) => (
    <div className="product-badges">
      <button 
        className={`favorite-button ${isFavorite ? 'active' : ''}`}
        onClick={() => onToggleFavorite(product.productID)}
        aria-label="Toggle favorite"
      >
        <Heart className="heart-icon" />
      </button>
      
      {product.category && (
        <span className="category-badge">
          <Tag className="category-icon" />
          {product.category}
        </span>
      )}
    </div>
  );

  const ProductInfo = ({ product, isAffordable, onRedeem, userPoints }) => (
    <div className="product-info">
      <ProductHeader product={product} />
      <ProductDescription product={product} />
      <ProductFooter 
        product={product} 
        isAffordable={isAffordable} 
        onRedeem={onRedeem} 
        userPoints={userPoints}
      />
    </div>
  );

  const ProductHeader = ({ product }) => (
    <div className="product-header">
      <h4 className="product-name">{product.name}</h4>
      <div className="points-badge">
        <Star className="points-star" />
        <span>{product.pointsRequired || 0} pts</span>
      </div>
    </div>
  );

  const ProductDescription = ({ product }) => (
    <p className="product-description">{product.description}</p>
  );

  const ProductFooter = ({ product, isAffordable, onRedeem, userPoints }) => (
    <div className="product-footer">
      <AffordabilityIndicator 
        isAffordable={isAffordable} 
        pointsRequired={product.pointsRequired || 0}
        userPoints={userPoints}
      />
      <RedeemButton 
        product={product} 
        isAffordable={isAffordable} 
        onRedeem={onRedeem} 
      />
    </div>
  );

  const AffordabilityIndicator = ({ isAffordable, pointsRequired, userPoints }) => (
    <div className="affordability">
      {isAffordable ? (
        <div className="can-afford">
          <CheckCircle className="afford-icon" />
          <span>You can afford this!</span>
        </div>
      ) : (
        <div className="cannot-afford">
          <AlertCircle className="afford-icon" />
          <span>Need {pointsRequired - userPoints} more points</span>
        </div>
      )}
    </div>
  );

  const RedeemButton = ({ product, isAffordable, onRedeem }) => (
          <button 
        className={`redeem-button ${isAffordable && product.stock > 0 ? 'available' : 'unavailable'}`}
        onClick={() => onRedeem(product)}
        disabled={!isAffordable || product.stock === 0}
      >
        <Zap className="redeem-icon" />
        {product.stock === 0 
          ? 'Out of Stock' 
          : !isAffordable 
            ? 'Insufficient Points' 
            : 'Redeem Now'
        }
      </button>
  );

  const RedemptionModal = () => {
    if (!showRedeemModal || !selectedProduct) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <ModalHeader />
          <ModalBody />
          <ModalFooter />
        </div>
      </div>
    );
  };

  const ModalHeader = () => (
    <div className="modal-header">
      <h3>{MODAL_CONTENT.title}</h3>
      <button 
        className="modal-close"
        onClick={handlers.closeRedeemModal}
        aria-label="Close modal"
      >
        ×
      </button>
    </div>
  );

  const ModalBody = () => (
    <div className="modal-body">
      <ModalProduct />
      <ModalBalance />
    </div>
  );

  const ModalProduct = () => (
    <div className="modal-product">
      {selectedProduct.image && (
        <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-product-image" />
      )}
      <div className="modal-product-info">
        <h4>{selectedProduct.name}</h4>
        <p>{selectedProduct.description}</p>
        <div className="modal-points">
          <Star className="modal-star" />
          <span>{selectedProduct.pointsRequired} points required</span>
        </div>
      </div>
    </div>
  );

  const ModalBalance = () => (
    <div className="modal-balance">
      <div className="balance-item">
        <span>{MODAL_CONTENT.currentBalance}</span>
        <span className="balance-value">{user?.points || 0} points</span>
      </div>
      <div className="balance-item">
        <span>{MODAL_CONTENT.afterRedemption}</span>
        <span className="balance-value">{(user?.points || 0) - (selectedProduct.pointsRequired || 0)} points</span>
      </div>
    </div>
  );

  const ModalFooter = () => (
    <div className="modal-footer">
      <button 
        className="modal-button cancel"
        onClick={handlers.closeRedeemModal}
      >
        {MODAL_CONTENT.cancel}
      </button>
      <button 
        className="modal-button confirm"
        onClick={handlers.confirmRedeem}
      >
        {MODAL_CONTENT.confirm}
      </button>
    </div>
  );

  const LoadingState = () => (
    <div className="home-container">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading available rewards...</p>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="home-container">
      <HomeNavbar />

      <main className="home-main">
        <RewardsOverviewSection />
        {/* <RewardStatsSection /> */}
        <FiltersSection />
        <ProductsSection />
      </main>

      <RedemptionModal />
      <HomeFooter />
    </div>
  );
};

export default RedeemRewards;