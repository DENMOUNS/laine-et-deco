import { toast } from 'sonner';
import { sendStockTransaction } from '../../../services/dashboardApi';
import { dispatchStaticEntityUpdate } from '../../../hooks/useStaticEntity';

export function createAdminFormSubmitHandler(getCtx: () => any) {
  return async (e: React.FormEvent<HTMLFormElement>) => {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = getCtx();

    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    let stockHandled = false;
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (modalType === 'category') {
          const nameValue = formData.get('name') as string;
          const slugValue = formData.get('slug') as string;
          const finalSlug = slugValue || (nameValue ? nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
          
          const categoryPayload: any = {
              name: nameValue,
              slug: finalSlug,
              image: formData.get('image') as string || 'https://picsum.photos/seed/cat/300/200',
              count: editingItem ? editingItem.count : 0,
              status: (formData.get('status') as 'active' | 'inactive') || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              categoryPayload.updatedAt = now;
              await updateCategory(editingItem.id, categoryPayload);
          } else {
              await addCategory({
                ...categoryPayload,
                id: `cat-${Date.now()}`,
                createdAt: now,
                updatedAt: now
              });
          }
      } else if (modalType === 'badge') {
        const newBadge: any = {
            id: editingItem.id,
            name: formData.get('name') as string,
            icon: formData.get('icon') as string,
            description: formData.get('description') as string,
            unlocked: editingItem.unlocked,
            badgeType: editingItem.badgeType,
            autoAssignRule: editingItem.autoAssignRule
        };
        const now = new Date().toISOString();
        newBadge.updatedAt = now;

        setSiteConfig((prev: any) => ({
            ...prev,
            loyaltyConfig: {
                ...prev.loyaltyConfig,
                badges: prev.loyaltyConfig.badges.map((b: any) => b.id === editingItem.id ? { ...b, ...newBadge } : b)
            }
        }));
      } else if (modalType === 'loyalty-config') {
        const levels = editingItem.levels.map((_: any, index: number) => ({
            groupId: formData.get(`groupId-${index}`) as string,
            minPoints: Number(formData.get(`minPoints-${index}`))
        }));
        setSiteConfig((prev: any) => ({
            ...prev,
            loyaltyConfig: {
                ...prev.loyaltyConfig,
                pointsPerPurchase: Number(formData.get('pointsPerPurchase')),
                pointsPerReview: Number(formData.get('pointsPerReview')),
                levels
            }
        }));
      } else if (modalType === 'pack') {
          const coverImageValue = formData.get('coverImage') as string;
          const newPack: any = {
              id: editingItem ? editingItem.id : `pack-${Date.now()}`,
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              products: selectedPackProducts,
              discountPercentage: Number(formData.get('discountPercentage')),
              promoCode: formData.get('promoCode') as string || `PACK${Date.now().toString().slice(-4)}`,
              status: editingItem?.status || 'active',
              ...(coverImageValue ? { coverImage: coverImageValue } : {}),
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newPack.updatedAt = now;
          } else {
              newPack.createdAt = now;
              newPack.updatedAt = now;
          }
          if (editingItem) {
              setLocalPacks(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...newPack } : p));
          } else {
              setLocalPacks(prev => [...prev, newPack]);
          }

      } else if (modalType === 'user') {
           const newUser: any = {
              id: editingItem ? editingItem.id : `user-${Date.now()}`,
              name: formData.get('name') as string,
              email: formData.get('email') as string,
              role: formData.get('role') as string,
              points: Number(formData.get('points')) || 0,
              joinDate: editingItem ? editingItem.joinDate : new Date().toISOString().split('T')[0],
              orders: editingItem?.orders || 0,
              password: formData.get('password') as string,
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newUser.updatedAt = now;

          } else {
              newUser.createdAt = now;
              newUser.updatedAt = now;
          }
          if (editingItem) {
              setLocalUsers(prev => prev.map(u => u.id === editingItem.id ? { ...u, ...newUser } : u));
              updateLocalUser(editingItem.id, newUser);
              toast.success('Utilisateur mis à jour');
          } else {
              const userUid = newUser.uid || newUser.id;
              setLocalUsers(prev => [...prev, newUser]);
              setLocalUser(userUid, newUser);
              toast.success('Utilisateur créé');
          }
      } else if (modalType === 'role') {
           const name = formData.get('name') as string;
           const slug = formData.get('slug') as string || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
           
           // Check for uniqueness of name and slug
           const nameExists = localRoles.some((r: any) => r.name.toLowerCase() === name.toLowerCase() && r.id !== editingItem?.id);
           const slugExists = localRoles.some((r: any) => (r.slug || r.id) === slug && r.id !== editingItem?.id);
           
           if (nameExists) {
               toast.error('Un rôle avec ce nom existe déjà.');
               return;
           }
           if (slugExists) {
               toast.error('Cet identifiant (slug) est déjà utilisé par un autre rôle.');
               return;
           }

           const newRole: any = {
              name: name,
              slug: slug,
              description: formData.get('description') as string,
              status: editingItem?.status || 'active'
           };

           // ID to use for the document
           const roleId = editingItem ? editingItem.id : slug;
           const now = new Date().toISOString();

           if (editingItem) {
               newRole.updatedAt = now;

               await updateLocalRole(roleId, newRole);
               toast.success('Rôle mis à jour');
           } else {
               newRole.createdAt = now;
               newRole.updatedAt = now;
               await setLocalRole(roleId, newRole);
               toast.success('Rôle créé');
           }
      } else if (modalType === 'notification') {
          const sendNow = formData.get('sendNow') === 'on';
          const status = formData.get('status') as string;
          const newNotif: any = {
              id: editingItem ? editingItem.id : `notif-${Date.now()}`,
              title: formData.get('title') as string,
              message: formData.get('message') as string,
              sentAt: sendNow ? new Date().toISOString().split('T')[0] : (editingItem ? editingItem.sentAt : ''),
              status: sendNow ? 'sent' : status,
              target: formData.get('target') as string,
              read: false,
              type: 'info'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newNotif.updatedAt = now;

          } else {
              newNotif.createdAt = now;
              newNotif.updatedAt = now;
          }
          if (editingItem) {
              setLocalPushNotifications(prev => prev.map(n => (n as any).id === editingItem.id ? { ...n, ...newNotif } : n));
          } else {
              setLocalPushNotifications(prev => [newNotif, ...prev]);
          }
          
          if (sendNow || status === 'sent') {
              window.dispatchEvent(new CustomEvent('push-notification', { detail: newNotif }));
          }
      } else if (modalType === 'email') {
           const newEmail: any = {
              id: editingItem ? editingItem.id : `email-${Date.now()}`,
              subject: formData.get('subject') as string,
              recipient: formData.get('recipient') as string,
              content: formData.get('content') as string,
              status: 'Envoyé',
              sentAt: new Date().toISOString().split('T')[0]
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newEmail.updatedAt = now;

          } else {
              newEmail.createdAt = now;
              newEmail.updatedAt = now;
          }
          if (editingItem) {
              setLocalEmails(prev => prev.map(e => (e as any).id === editingItem.id ? { ...e, ...newEmail } : e));
          } else {
              setLocalEmails(prev => [newEmail, ...prev]);
          }
       } else if (modalType === 'customer' || modalType === 'user') {
           const email = formData.get('email') as string;
           
           // Check for email uniqueness
           const emailExists = localUsers.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== editingItem?.id);
           if (emailExists) {
               toast.error('Cette adresse email est déjà utilisée par un autre utilisateur.');
               return;
           }

           const newUser: any = {
              name: formData.get('name') as string,
              email: email,
              role: formData.get('role') as string,
              joinDate: editingItem ? editingItem.joinDate : new Date().toISOString().split('T')[0],
              orders: editingItem?.orders || 0,
              totalSpent: editingItem?.totalSpent || 0,
              avatar: editingItem?.avatar || 'https://i.pravatar.cc/150?u=' + Date.now(),
              status: editingItem?.status || 'active'
           };
           const now = new Date().toISOString();
           const userId = editingItem ? editingItem.id : `user-${Date.now()}`;

           if (editingItem) {
               newUser.updatedAt = now;

               await updateLocalUser(userId, newUser);
               toast.success('Utilisateur mis à jour');
           } else {
               newUser.createdAt = now;
               newUser.updatedAt = now;
               await setLocalUser(userId, newUser);
               toast.success('Utilisateur créé');
           }
      } else if (modalType === 'event') {
           const newEvent: any = {
              id: editingItem ? editingItem.id : `evt-${Date.now()}`,
              name: formData.get('name') as string,
              startDate: formData.get('startDate') as string,
              endDate: formData.get('endDate') as string,
              discountPercentage: Number(formData.get('discountPercentage')),
              applyToAll: formData.get('applyToAll') === 'all',
              isActive: true
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newEvent.updatedAt = now;

          } else {
              newEvent.createdAt = now;
              newEvent.updatedAt = now;
          }
          if (editingItem) {
              updateEvent(editingItem.id, newEvent);
          } else {
              addEvent(newEvent);
          }
      } else if (modalType === 'expense') {
          const newExpense: any = {
              id: editingItem ? editingItem.id : `exp-${Date.now()}`,
              description: formData.get('description') as string,
              amount: Number(formData.get('amount')),
              date: formData.get('date') as string,
              category: formData.get('category') as string,
              status: editingItem?.status || 'pending'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newExpense.updatedAt = now;

          } else {
              newExpense.createdAt = now;
              newExpense.updatedAt = now;
          }
          if (editingItem) {
              updateExpense(editingItem.id, newExpense);
          } else {
              addExpense(newExpense);
          }
      } else if (modalType === 'lookbook') {
          const newLookbook: any = {
              id: editingItem ? editingItem.id : Date.now(),
              image: formData.get('image') as string || 'https://picsum.photos/seed/look/800/1000',
              caption: formData.get('caption') as string,
              tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t),
              initialLikes: editingItem ? editingItem.initialLikes : 0,
              initialComments: editingItem ? editingItem.initialComments : 0,
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newLookbook.updatedAt = now;

          } else {
              newLookbook.createdAt = now;
              newLookbook.updatedAt = now;
          }
          if (editingItem) {
              updateLookbook(editingItem.id, newLookbook);
          } else {
              addLookbook(newLookbook);
          }
      } else if (modalType === 'blog') {
          const newBlog: any = {
              id: editingItem ? editingItem.id : `b${Date.now()}`,
              title: formData.get('title') as string,
              category: formData.get('category') as string,
              date: new Date().toLocaleDateString(),
              image: formData.get('image') as string || 'https://picsum.photos/seed/blog/800/600',
              excerpt: formData.get('excerpt') as string,
              content: formData.get('content') as string,
              status: editingItem?.status || 'published'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newBlog.updatedAt = now;

          } else {
              newBlog.createdAt = now;
              newBlog.updatedAt = now;
          }
          if (editingItem) {
              updateBlogPost(editingItem.id, newBlog);
          } else {
              addBlogPost(newBlog);
          }
      } else if (modalType === 'customer-group') {
          const newGroup: any = {
              id: editingItem ? editingItem.id : `group-${Date.now()}`,
              name: formData.get('name') as string,
              discountPercentage: Number(formData.get('discountPercentage')),
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newGroup.updatedAt = now;

          } else {
              newGroup.createdAt = now;
              newGroup.updatedAt = now;
          }
          if (editingItem) {
              updateCustomerGroup(editingItem.id, newGroup);
          } else {
              addCustomerGroup(newGroup);
          }
      } else if (modalType === 'tax') {
          const newTax: any = {
              id: editingItem ? editingItem.id : `tax-${Date.now()}`,
              name: formData.get('name') as string,
              rate: Number(formData.get('rate')),
              country: formData.get('country') as string,
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newTax.updatedAt = now;

          } else {
              newTax.createdAt = now;
              newTax.updatedAt = now;
          }
          if (editingItem) {
              updateTaxRule(editingItem.id, newTax);
          } else {
              addTaxRule(newTax);
          }
      } else if (modalType === 'shipping') {
          const ruleType = (formData.get('type') as string) || 'zone';
          let condition = formData.get('condition') as string;
          // For threshold rules, build the condition from thresholdAmount if condition is empty/default
          if (ruleType === 'threshold') {
              const thresholdAmount = formData.get('thresholdAmount') as string;
              if (thresholdAmount) {
                  condition = `Total > ${thresholdAmount}`;
              }
          }
          const newShipping: any = {
              id: editingItem ? editingItem.id : `ship-${Date.now()}`,
              name: formData.get('name') as string,
              price: Number(formData.get('price')),
              type: ruleType,
              condition: condition || '',
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newShipping.updatedAt = now;

          } else {
              newShipping.createdAt = now;
              newShipping.updatedAt = now;
          }
          if (editingItem) {
              updateShippingRule(editingItem.id, newShipping);
          } else {
              addShippingRule(newShipping);
          }
      } else if (modalType === 'nav_item') {
          const newNavItem: any = {
              id: editingItem ? editingItem.id : `nav-${Date.now()}`,
              name: formData.get('name') as string,
              view: formData.get('view') as string,
              order: Number(formData.get('order')),
              status: formData.get('status') as 'active' | 'inactive' || 'active',
              position: formData.get('position') as 'top' | 'side' || 'top'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newNavItem.updatedAt = now;

              updateNavItem(editingItem.id, newNavItem);
          } else {
              newNavItem.createdAt = now;
              newNavItem.updatedAt = now;
              addNavItem(newNavItem);
          }
      } else if (modalType === 'catalog-rule') {
          const newRule: any = {
              id: editingItem ? editingItem.id : `rule-${Date.now()}`,
              name: formData.get('name') as string,
              condition: formData.get('condition') as string,
              discount: Number(formData.get('discount')),
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newRule.updatedAt = now;

          } else {
              newRule.createdAt = now;
              newRule.updatedAt = now;
          }
          if (editingItem) {
              updateCatalogRule(editingItem.id, newRule);
          } else {
              addCatalogRule(newRule);
          }
      } else if (modalType === 'currency') {
          const newCurrency: any = {
              id: editingItem ? editingItem.id : `curr-${Date.now()}`,
              code: formData.get('code') as string,
              name: formData.get('name') as string,
              symbol: formData.get('symbol') as string,
              rate: Number(formData.get('rate')),
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newCurrency.updatedAt = now;

              updateCurrency(editingItem.id, newCurrency);
          } else {
              newCurrency.createdAt = now;
              newCurrency.updatedAt = now;
              addCurrency(newCurrency);
          }
      } else if (modalType === 'quick-stock-adjust') {
          const quantityChange = Number(formData.get('quantityChange'));
          const note = formData.get('note') as string || '';
          const product = editingItem;

          if (!product) {
              toast.error('Produit introuvable');
              return;
          } else if (!quantityChange) {
              toast.error('Quantité invalide');
              return;
          } else {
              try {
                  const type = quantityChange > 0 ? 'add' : 'remove';
                  const quantity = Math.abs(quantityChange);
                  const res: any = await sendStockTransaction(product.id, type, quantity, note);
                  const updatedProduct = res?.product;
                  const normalizedProduct = updatedProduct
                    ? {
                        ...updatedProduct,
                        stock: updatedProduct.stock ?? updatedProduct.quantity ?? 0,
                        quantity: updatedProduct.quantity ?? updatedProduct.stock ?? 0,
                      }
                    : null;
                  if (normalizedProduct) {
                      setLocalProducts(prev => {
                          const newArray = prev.map(p => {
                              if (p.id === product.id) {
                                  const merged = { ...p, ...normalizedProduct };
                                  return merged;
                              }
                              return p;
                          });
                          return newArray;
                      });
                      setEditingItem(prev => prev?.id === product.id ? { ...prev, ...normalizedProduct } : prev);
                      dispatchStaticEntityUpdate('product', { record: normalizedProduct });
                  } else {
                      const newStock = Math.max(0, (product.stock || 0) + quantityChange);
                      const inStock = newStock > 0;
                      setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock, quantity: newStock, in_stock: inStock } : p));
                      setEditingItem(prev => prev?.id === product.id ? { ...prev, stock: newStock, quantity: newStock, in_stock: inStock } : prev);
                  }
                  toast.success(`Stock ajusté pour ${product.name}`);
                  stockHandled = true;
              } catch (err: any) {
                  toast.error(err?.message || 'Erreur lors de l\'ajustement du stock');
              }
          }
      } else if (modalType === 'inventory-adjustment') {
          const productId = formData.get('productId') as string;
          const quantityChange = Number(formData.get('quantityChange'));
          const note = formData.get('note') as string || '';
          const product = localProducts.find(p => p.id === productId);

          if (!product) {
              toast.error('Produit introuvable');
          } else if (!quantityChange) {
              toast.error('Quantité invalide');
          } else {
              try {
                  const type = quantityChange > 0 ? 'add' : 'remove';
                  const quantity = Math.abs(quantityChange);
                  const res: any = await sendStockTransaction(productId, type, quantity, note);
                  // Server returns updated product in res.product
                  const updatedProduct = res?.product;
                  const normalizedProduct = updatedProduct
                    ? {
                        ...updatedProduct,
                        stock: updatedProduct.stock ?? updatedProduct.quantity ?? 0,
                        quantity: updatedProduct.quantity ?? updatedProduct.stock ?? 0,
                      }
                    : null;
                  if (normalizedProduct) {
                      setLocalProducts(prev => prev.map(p => p.id === productId ? { ...p, ...normalizedProduct } : p));
                      setEditingItem(prev => prev?.id === productId ? { ...prev, ...normalizedProduct } : prev);
                      dispatchStaticEntityUpdate('product', { record: normalizedProduct });
                  } else {
                      // Fallback: adjust locally
                      const newStock = Math.max(0, (product.stock || 0) + quantityChange);
                      const inStock = newStock > 0;
                      setLocalProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock, quantity: newStock, in_stock: inStock } : p));
                      setEditingItem(prev => prev?.id === productId ? { ...prev, stock: newStock, quantity: newStock, in_stock: inStock } : prev);
                  }
                  toast.success(`Transaction de stock enregistrée pour ${product.name}`);
                  stockHandled = true;
              } catch (err: any) {
                  toast.error(err?.message || 'Erreur lors de la transaction de stock');
              }
          }
      }

      if (!stockHandled) toast.success(editingItem ? 'Modifications enregistrées avec succès' : 'Élément ajouté avec succès');
      if (['category-create', 'category-edit'].includes(activeTab)) {
          setActiveTab('categories');
          setEditingItem(null);
      }
      setIsAddModalOpen(false);
      if (activeTab !== 'inventory-detail') {
          setEditingItem(null);
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };
}
