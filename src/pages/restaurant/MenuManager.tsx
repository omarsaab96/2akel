import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useMenuStore } from '../../stores/menuStore';
import { Category, MenuItem } from '../../types';
import { Plus, Edit, Trash2, Move, Check, X, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toast } from 'react-hot-toast';

const MenuManager = () => {
  const hydrateFromDB = useMenuStore((s) => s.hydrateFromDB);
  const isLoading = useMenuStore((s) => s.isLoading);

  const { user } = useAuthStore();
  const {
    categories,
    menuItems,
    getCategoriesByRestaurant,
    getMenuItemsByCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reorderCategories
  } = useMenuStore();

  const [restaurantCategories, setRestaurantCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Category form
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Item form
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemFeatured, setItemFeatured] = useState(false);

  // Reordering state
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem("menu-storage");
    if (!local) {
      hydrateFromDB().catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const userCategories = getCategoriesByRestaurant(user.id);
      setRestaurantCategories(userCategories);
    }
  }, [user, categories, menuItems, getCategoriesByRestaurant]);

  const handleAddCategory = () => {
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!user) return;

    const newCategory = addCategory({
      name: categoryName,
      description: categoryDescription,
      displayOrder: restaurantCategories.length,
      restaurantId: user.id,
    });

    setCategoryName('');
    setCategoryDescription('');
    setShowCategoryForm(false);

    // Expand the newly added category
    setExpandedCategories([...expandedCategories, newCategory.id]);

    toast.success('Category added successfully');
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    updateCategory(editingCategory, {
      name: categoryName,
      description: categoryDescription,
    });

    setCategoryName('');
    setCategoryDescription('');
    setEditingCategory(null);
    setShowCategoryForm(false);

    toast.success('Category updated successfully');
  };

  const handleEditCategory = (category: Category) => {
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setEditingCategory(category.id);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? All menu items in this category will also be deleted.')) {
      deleteCategory(categoryId);
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
      toast.success('Category and its items deleted successfully');
    }
  };

  const handleAddMenuItem = async () => {
    if (!itemName.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (!itemPrice || isNaN(parseFloat(itemPrice)) || parseFloat(itemPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const itemAddedSuccessfully = await addMenuItem({
        name: itemName,
        description: itemDescription,
        price: parseFloat(itemPrice),
        categoryId: itemCategoryId,
        available: itemAvailable,
        featured: itemFeatured,
      });

      resetItemForm();
      setShowItemForm(false);
      toast.success('Menu item added successfully');

    } catch (error) {
      console.error('Failed to add menu item:', error);
      toast.error('Failed to add menu item');
    }
  };

  const handleUpdateMenuItem = () => {
    if (!editingItem) return;

    if (!itemName.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (!itemPrice || isNaN(parseFloat(itemPrice)) || parseFloat(itemPrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    updateMenuItem(editingItem, {
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice),
      categoryId: itemCategoryId,
      available: itemAvailable,
      featured: itemFeatured,
    });

    resetItemForm();
    setEditingItem(null);
    setShowItemForm(false);

    toast.success('Menu item updated successfully');
  };

  const handleEditMenuItem = (item: MenuItem) => {
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemCategoryId(item.categoryId);
    setItemAvailable(item.available);
    setItemFeatured(item.featured);
    setEditingItem(item.id);
    setShowItemForm(true);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      deleteMenuItem(itemId);
      toast.success('Menu item deleted successfully');
    }
  };

  const resetItemForm = () => {
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemAvailable(true);
    setItemFeatured(false);
  };

  const moveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = restaurantCategories.findIndex(c => c.id === categoryId);

    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === restaurantCategories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const reorderedCategories = [...restaurantCategories];

    // Swap positions
    [reorderedCategories[currentIndex], reorderedCategories[newIndex]] =
      [reorderedCategories[newIndex], reorderedCategories[currentIndex]];

    // Update display order based on new positions
    const categoryIds = reorderedCategories.map(c => c.id);

    reorderCategories(categoryIds);
  };

  const toggleCategoryExpand = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Menu Management</h1>
        <div className="flex space-x-3">
          <Button
            variant={!reordering ? 'outline' : 'primary'}
            icon={Move}
            onClick={() => setReordering(!reordering)}
          >
            {reordering ? 'Done Reordering' : 'Reorder Categories'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center pt-10">
          <p className="text-lg font-semibold animate-pulse">Loading menu...</p>
        </div>
      )}

      {!isLoading && (
        <div>
          {/* Main content */}
          <div className="grid grid-cols-1 gap-6">
            {restaurantCategories.length === 0 ? (
              <Card noPadding={true} className='p-2'>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Menu Categories Yet</h3>
                  <p className="text-gray-500 mb-4">Start by creating categories for your menu items.</p>
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => {
                      setShowCategoryForm(true);
                      setEditingCategory(null);
                      setCategoryName('');
                      setCategoryDescription('');
                    }}
                  >
                    Add Your First Category
                  </Button>
                </div>
              </Card>
            ) : (
              restaurantCategories.map((category) => {
                const categoryItems = getMenuItemsByCategory(category.id);
                const isExpanded = expandedCategories.includes(category.id);

                return (
                  <Card noPadding={true} key={category.id} className="p-2 overflow-visible">
                    <div className="flex justify-between items-center">
                      <div
                        className="flex items-start cursor-pointer flex-grow"
                        onClick={() => toggleCategoryExpand(category.id)}
                      >
                        <button className="mr-2 text-gray-500 mt-[5px]">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {reordering ? (
                          <>
                            <Button
                              variant="ghost"
                              icon={ChevronUp}
                              onClick={() => moveCategory(category.id, 'up')}
                              className="!p-1 gap-1"
                            >Move up</Button>
                            <Button
                              variant="ghost"
                              icon={ChevronDown}
                              onClick={() => moveCategory(category.id, 'down')}
                              className="!p-1 gap-1"
                            >Move down</Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              icon={Plus}
                              iconSize="4"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowItemForm(true);
                                setEditingItem(null);
                                resetItemForm();
                                setItemCategoryId(category.id);
                              }}
                              className="!text-xs text-gray-500 hover:text-primary !p-1 gap-1"
                            >
                              Add Item
                            </Button>
                            <Button
                              variant="ghost"
                              icon={Edit}
                              iconSize="4"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategory(category);
                              }}
                              className="!text-xs text-gray-500 hover:text-primary !p-1"
                              >
                              Edit Category
                            </Button>
                            <Button
                              variant="ghost"
                              icon={Trash2}
                              iconSize="4"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                              className="!text-xs text-gray-500 hover:text-error !p-1"
                              >
                              Delete Category
                            </Button>

                          </>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 border-t pt-4">
                        {categoryItems.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <p>No items in this category.</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowItemForm(true);
                                setEditingItem(null);
                                resetItemForm();
                                setItemCategoryId(category.id);
                              }}
                              className="mt-2"
                            >
                              Add Item
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-0">
                            {categoryItems.map((item) => (
                              <div
                                key={item.id}
                                className='py-2 border-b bg-white bg-gray-100 last:border-0'
                              >
                                <div className="flex justify-between items-center">
                                  <div className={`flex justify-start items-center w-full pr-[40px] ${!item.available ? 'opacity-50' : ''}`}>
                                    <div className='flex gap-2 w-[70%] pr-[20px]'>
                                      <div className="image w-[10%] bg-gray-200 rounded-lg overflow-hidden">
                                        <img className={`w-full h-[40px] object-cover ${item.image ? '' : 'opacity-30'} `} src={item.image || "/default.png"} alt={item.name} />
                                      </div>
                                      <div className="flex flex-col w-[85%]">
                                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                      </div>

                                    </div>

                                    <div className="w-[30%] flex flex-col">
                                      <p className="text-primary font-semibold">${item.price.toFixed(2)}</p>

                                      <div className="flex gap-4">
                                        {!item.available && (
                                          <span className="text-xs text-gray-400">
                                            Not available
                                          </span>
                                        )}

                                        {item.featured && (
                                          <span className="text-xs text-accent">
                                            Featured
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                  </div>

                                  <div className="flex space-x-4">
                                    <Button
                                      variant="ghost"
                                      icon={Edit}
                                      onClick={() => handleEditMenuItem(item)}
                                      className="text-gray-500 hover:text-primary !p-0"
                                    />
                                    <Button
                                      variant="ghost"
                                      icon={Trash2}
                                      onClick={() => handleDeleteMenuItem(item.id)}
                                      className="text-gray-500 hover:text-error !p-0"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>

          {/* Category form modal */}
          {showCategoryForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                  </h2>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    editingCategory ? handleUpdateCategory() : handleAddCategory();
                  }}>
                    <Input
                      label="Category Name"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="e.g., Appetizers"
                      required
                      autoFocus
                    />

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Description (optional)
                      </label>
                      <textarea
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        placeholder="e.g., Starters and small plates"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowCategoryForm(false);
                          setCategoryName('');
                          setCategoryDescription('');
                          setEditingCategory(null);
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                      >
                        {editingCategory ? 'Update Category' : 'Add Category'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Menu item form modal */}
          {showItemForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </h2>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    editingItem ? handleUpdateMenuItem() : handleAddMenuItem();
                  }}>
                    <Input
                      label="Item Name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g., Caesar Salad"
                      required
                      autoFocus
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={itemPrice}
                            onChange={(e) => setItemPrice(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={itemCategoryId}
                          onChange={(e) => setItemCategoryId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        >
                          {restaurantCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        placeholder="e.g., Fresh romaine lettuce with Caesar dressing, croutons, and parmesan cheese"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-6 mb-4">
                      <div className="flex items-center">
                        <input
                          id="available"
                          type="checkbox"
                          checked={itemAvailable}
                          onChange={(e) => setItemAvailable(e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                          Available
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="featured"
                          type="checkbox"
                          checked={itemFeatured}
                          onChange={(e) => setItemFeatured(e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                          Featured
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowItemForm(false);
                          resetItemForm();
                          setEditingItem(null);
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                      >
                        {editingItem ? 'Update Item' : 'Add Item'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          <Button
            fullWidth="true"
            variant="outline"
            icon={Plus}
            className='mt-6'
            onClick={() => {
              setShowCategoryForm(true);
              setEditingCategory(null);
              setCategoryName('');
              setCategoryDescription('');
            }}
          >
            Add Category
          </Button>
        </div>
      )}
    </div>
  );
};

export default MenuManager;