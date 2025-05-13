import React, { useState, useEffect } from "react";
import "./MasterGoPage.css";

const dishes = [
  {
    name: "避风塘龙虾",
    price: "$23",
    desc: "吃了经典的避风塘红霞和美极龙虾，肉质相当紧实",
    img: "https://image-resource.mastergo.com/117607017382670/117607017382672/927a13374684895e5ac3d723606bb075.png",
    tag: "近三月人气推荐",
    tagColor: "#F6F6F6",
    tagTextColor: "#111111"
  },
  {
    name: "上汤豆苗",
    price: "$35",
    desc: "另外送5个小点心",
    img: "https://image-resource.mastergo.com/117607017382670/117607017382672/930910051abfa0dd45b105b99d9b0a0f.png",
    tag: "天津「小酥肉」第7名",
    tagColor: "#F6F6F6",
    tagTextColor: "#111111"
  },
  {
    name: "例汤",
    price: "$28.1",
    desc: "很新鲜，味道很好",
    img: "https://image-resource.mastergo.com/117607017382670/117607017382672/7a5119bb58d2e101dc1f4e1baa924293.png",
    tag: "",
    tagColor: "#F6F6F6",
    tagTextColor: "#111111"
  },
  {
    name: "排骨汤",
    price: "$28.1",
    desc: "很新鲜，味道很好",
    img: "https://image-resource.mastergo.com/117607017382670/117607017382672/3756cd8d44c0139d1548277ec89ab9f8.png",
    tag: "",
    tagColor: "#F6F6F6",
    tagTextColor: "#111111"
  },
  {
    name: "龙虾膏炒饭",
    price: "$28.1",
    desc: "很新鲜，味道很好",
    img: "https://image-resource.mastergo.com/117607017382670/117607017382672/ae64c294ac2fb6d88054bd96c97f7abc.png",
    tag: "",
    tagColor: "#F6F6F6",
    tagTextColor: "#111111"
  }
];

const MasterGoPage: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>(["网友推荐"]);
  const [likedItems, setLikedItems] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(true);

  // 模拟加载效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(item => item !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const toggleLike = (dishName: string) => {
    setLikedItems(prev => ({
      ...prev,
      [dishName]: !prev[dishName]
    }));
  };

  const renderRankLabel = (index: number) => {
    const colors = ["#FF7946", "#EE8778", "#F99E11"];
    if (index < 3) {
      return (
        <div className="rank-label" style={{backgroundColor: colors[index]}}>
          <div className="rank-number">{index + 1}</div>
          <div className="wheat-left"></div>
          <div className="wheat-right"></div>
          <div className="top-tag">TOP</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mastergo-container">
      {/* 顶部图片和返回按钮 */}
      <div className="header-container">
        <div className="header-image-container">
          <img src="https://image-resource.mastergo.com/117607017382670/117607017382672/ae64c294ac2fb6d88054bd96c97f7abc.png" alt="banner" className="header-image" />
          <div className="header-gradient-overlay"></div>
        </div>
        
        <button className="back-button">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M0.706822 0.707391L1.41422 0.000569L0.000569 -1.41422L-0.706822 -0.707391L-7.00506 5.58579L-13.2926 -0.706822L-13.2934 -0.70764L-13.9994 -1.41422L-14.7068 -0.707395L-15.4142 -0.000569L-14.7074 0.706822L-7.71303 7.70682Q-7.57243 7.84753 -7.38869 7.92372Q-7.20495 7.99992 -7.00604 8Q-6.80712 8.00008 -6.62332 7.92403Q-6.43952 7.84799 -6.29881 7.70739L0.706822 0.707391Z" 
                  transform="rotate(90 8 8)" 
                  fill="white"/>
          </svg>
        </button>
        
        <div className="title-container">
          <div className="wheat-decoration left">
            <svg width="27" height="44" viewBox="0 0 27 44">
              <path d="M17.0566 0.0002575C16.5296 0.104467 13.8695 3.62096 13.4962 7.96649C13.319 10.0322 13.6958 12.0886 14.6279 14.1369C16.6587 11.2306 17.815 8.55585 18.0991 6.11272C18.6625 1.21719 17.1705 -0.0205844 17.0566 0.0002575ZM17.3078 14.8293C19.874 11.0511 24.2291 8.87427 24.3958 8.93796C24.5038 8.9808 24.8231 12.9674 21.3155 16.9563C20.3517 18.0505 18.423 19.5801 15.5247 21.5415C15.493 18.8633 16.0894 16.6286 17.3078 14.8293ZM26.9784 18.3562C26.814 18.2589 21.3953 19.1493 18.1789 22.8221C16.6493 24.5705 15.547 26.7937 14.872 29.4973C18.146 28.5409 20.6241 27.317 22.3121 25.8222C26.9655 21.7036 27.0864 18.4164 26.9784 18.355L26.9784 18.3562ZM14.467 31.8733C20.0254 29.0967 23.1139 30.2164 23.1315 30.3403C23.1573 30.5278 20.3048 35.2231 15.6961 36.8325C13.5033 37.5979 11.0299 37.7878 8.27358 37.3999C10.3878 34.7217 12.4515 32.8783 14.467 31.8733ZM15.7947 41.9098C15.7407 41.5625 14.5656 39.9113 9.01431 39.3162C6.79331 39.0788 3.78697 39.806 0 41.4999C1.57301 42.6115 3.53341 43.3618 5.87885 43.7567C11.9913 44.7837 15.4167 42.2468 15.7642 41.9388L15.7947 41.9098Z" 
                    fill="linear-gradient(0deg, #FBDFB9 -55%, #FFFFFF 100%)"/>
            </svg>
          </div>
          
          <div className="title-text">招牌菜</div>
          
          <div className="wheat-decoration right">
            <svg width="27" height="44" viewBox="0 0 27 44" style={{transform: "scaleX(-1)"}}>
              <path d="M17.0566 0.0002575C16.5296 0.104467 13.8695 3.62096 13.4962 7.96649C13.319 10.0322 13.6958 12.0886 14.6279 14.1369C16.6587 11.2306 17.815 8.55585 18.0991 6.11272C18.6625 1.21719 17.1705 -0.0205844 17.0566 0.0002575ZM17.3078 14.8293C19.874 11.0511 24.2291 8.87427 24.3958 8.93796C24.5038 8.9808 24.8231 12.9674 21.3155 16.9563C20.3517 18.0505 18.423 19.5801 15.5247 21.5415C15.493 18.8633 16.0894 16.6286 17.3078 14.8293ZM26.9784 18.3562C26.814 18.2589 21.3953 19.1493 18.1789 22.8221C16.6493 24.5705 15.547 26.7937 14.872 29.4973C18.146 28.5409 20.6241 27.317 22.3121 25.8222C26.9655 21.7036 27.0864 18.4164 26.9784 18.355L26.9784 18.3562ZM14.467 31.8733C20.0254 29.0967 23.1139 30.2164 23.1315 30.3403C23.1573 30.5278 20.3048 35.2231 15.6961 36.8325C13.5033 37.5979 11.0299 37.7878 8.27358 37.3999C10.3878 34.7217 12.4515 32.8783 14.467 31.8733ZM15.7947 41.9098C15.7407 41.5625 14.5656 39.9113 9.01431 39.3162C6.79331 39.0788 3.78697 39.806 0 41.4999C1.57301 42.6115 3.53341 43.3618 5.87885 43.7567C11.9913 44.7837 15.4167 42.2468 15.7642 41.9388L15.7947 41.9098Z" 
                    fill="linear-gradient(0deg, #FBDFB9 -55%, #FFFFFF 100%)"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* 筛选标签 */}
      <div className="filter-container">
        <div className={`filter-tag ${activeFilters.includes("店家甄选") ? 'active' : ''}`} onClick={() => toggleFilter("店家甄选")}>
          <div className="filter-icon diamond"></div>
          <span>店家甄选</span>
        </div>
        <div className={`filter-tag ${activeFilters.includes("网友推荐") ? 'active' : ''}`} onClick={() => toggleFilter("网友推荐")}>
          <div className="filter-icon thumbs-up"></div>
          <span>网友推荐</span>
        </div>
      </div>
      
      {/* 菜品卡片列表 */}
      <div className="dishes-container">
        {loading ? (
          // 加载状态
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : (
          dishes.map((dish, idx) => (
            <div key={dish.name} className="dish-card">
              {idx < 3 && renderRankLabel(idx)}
              <div className="dish-image-container">
                <img src={dish.img} alt={dish.name} className="dish-image" />
              </div>
              <div className="dish-info">
                <div className="dish-name">{dish.name}</div>
                <div className="dish-desc">{dish.desc}</div>
                <div className="dish-bottom">
                  <div className="dish-left">
                    <span className="dish-price">{dish.price}</span>
                    {dish.tag && <span className="dish-tag">{dish.tag}</span>}
                  </div>
                  <div className="dish-actions">
                    <div 
                      className={`action-icon ${likedItems[dish.name] ? 'liked' : ''}`} 
                      onClick={() => toggleLike(dish.name)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path 
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                          fill={likedItems[dish.name] ? "#FF7946" : "none"} 
                          stroke={likedItems[dish.name] ? "#FF7946" : "#BEBEBE"}
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MasterGoPage;