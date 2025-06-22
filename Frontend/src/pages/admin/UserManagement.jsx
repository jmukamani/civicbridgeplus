import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, User, Shield, Mail, Trash2, Edit, Check, X 
} from 'lucide-react';

const UserManagement = () => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let usersData;
        
        if (isOnline) {
          const response = await api.get('/admin/users');
          usersData = response.data;
          await cacheData('adminUsers', usersData);
        } else {
          usersData = await getCachedData('adminUsers') || [];
          toast(t('offlineDataWarning'), { icon: '⚠️' });
        }
        
        setUsers(usersData);
        setIsLoading(false);
      } catch (error) {
        toast.error(t('error.fetchingUsers'));
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOnline, t]);

  useEffect(() => {
    // Apply filters and search
    let results = [...users];
    
    // Apply role filter
    if (selectedRole !== 'all') {
      results = results.filter(user => user.role === selectedRole);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      results = results.filter(user => 
        selectedStatus === 'verified' ? user.verified : !user.verified
      );
    }
    
    // Apply search
    if (searchQuery) {
      results = results.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.county?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(results);
  }, [users, selectedRole, selectedStatus, searchQuery]);

  const handleVerifyUser = async (userId) => {
    if (!isOnline) {
      toast.error(t('error.offlineAction'));
      return;
    }

    try {
      await api.patch(`/admin/users/${userId}/verify`);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, verified: true } : user
      ));
      toast.success(t('success.userVerified'));
    } catch (error) {
      toast.error(t('error.verifyingUser'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isOnline) {
      toast.error(t('error.offlineAction'));
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      toast.success(t('success.userDeleted'));
    } catch (error) {
      toast.error(t('error.deletingUser'));
    }
  };

  const handleBulkVerify = async () => {
    if (!isOnline) {
      toast.error(t('error.offlineAction'));
      return;
    }

    if (selectedUsers.length === 0) return;

    try {
      await api.patch('/admin/users/bulk-verify', {
        userIds: selectedUsers
      });
      
      setUsers(users.map(user =>
        selectedUsers.includes(user.id) ? { ...user, verified: true } : user
      ));
      
      setSelectedUsers([]);
      toast.success(t('success.bulkVerifyCompleted'));
    } catch (error) {
      toast.error(t('error.bulkActionFailed'));
    }
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{t('adminUsers.title')}</h2>
        
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('adminUsers.searchPlaceholder')}
              className="form-input pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="form-select"
          >
            <option value="all">{t('adminUsers.allRoles')}</option>
            <option value="citizen">{t('roles.citizen')}</option>
            <option value="representative">{t('roles.representative')}</option>
            <option value="admin">{t('roles.admin')}</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select"
          >
            <option value="all">{t('adminUsers.allStatuses')}</option>
            <option value="verified">{t('adminUsers.verified')}</option>
            <option value="unverified">{t('adminUsers.unverified')}</option>
          </select>
        </div>
      </div>
      
      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <div className="bg-gray-100 p-2 flex items-center justify-between">
          <div className="text-sm">
            {t('adminUsers.selectedCount', { count: selectedUsers.length })}
          </div>
          <div className="space-x-2">
            <button
              onClick={handleBulkVerify}
              className="btn-primary px-3 py-1 text-sm"
            >
              <Check size={16} className="mr-1 inline" />
              {t('adminUsers.verifySelected')}
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              {t('adminUsers.clearSelection')}
            </button>
          </div>
        </div>
      )}
      
      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('adminUsers.name')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('adminUsers.role')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('adminUsers.county')}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('adminUsers.status')}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr 
                  key={user.id} 
                  className={`hover:bg-gray-50 ${
                    selectedUsers.includes(user.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.role === 'admin' && (
                        <Shield size={16} className="mr-2 text-red-500" />
                      )}
                      {user.role === 'representative' && (
                        <User size={16} className="mr-2 text-blue-500" />
                      )}
                      {user.role === 'citizen' && (
                        <User size={16} className="mr-2 text-green-500" />
                      )}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.county || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.verified ? t('verified') : t('unverified')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {!user.verified && (
                        <button
                          onClick={() => handleVerifyUser(user.id)}
                          disabled={!isOnline}
                          className={`p-1 rounded ${
                            isOnline
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400'
                          }`}
                          title={t('adminUsers.verifyUser')}
                        >
                          <Check size={18} />
                        </button>
                      )}
                      <Link
                        to={`/admin/users/edit/${user.id}`}
                        className="p-1 rounded text-blue-600 hover:bg-blue-50"
                        title={t('edit')}
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={!isOnline}
                        className={`p-1 rounded ${
                          isOnline
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-gray-400'
                        }`}
                        title={t('delete')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  {t('adminUsers.noUsersFound')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;