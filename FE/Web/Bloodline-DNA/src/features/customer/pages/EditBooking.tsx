import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  SaveIcon,
  ArrowLeftIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  HomeIcon,
  BuildingIcon,
  XCircleIcon
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/Breadcrumb";
import { Header } from "../../../components";
import { Footer } from "../../../components";
import { 
  updateBookingApi, 
  mapFormDataToUpdateRequest,
  formatDateForInput,
  statusToNumber
} from "../api/bookingUpdateApi";
import { 
  getBookingByIdApi, 
  formatBookingDate, 
  formatPrice, 
  getStatusDisplay 
} from "../api/bookingListApi";

// Local interface for BookingItem to avoid import issues
interface BookingItem {
  id: string;
  testServiceId: string;
  clientId: string;
  email: string;
  appointmentDate: string;
  price: number;
  collectionMethod: string;
  status: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  address: string;
  phone: string;
}

interface EditBookingData {
  id: string;
  testType: string;
  serviceType: 'home' | 'clinic';
  name: string;
  phone: string;
  email: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
}

const statusConfig: Record<EditBookingData['status'], { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircleIcon },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
  in_progress: { label: 'Đang thực hiện', color: 'bg-indigo-100 text-indigo-800', icon: ClockIcon },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircleIcon }
};

const getStatusDisplayInfo = (status: EditBookingData['status']) => {
  return statusConfig[status] || statusConfig.pending;
};

export const EditBooking = (): React.JSX.Element => {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<EditBookingData>({
    id: '',
    testType: '',
    serviceType: 'home',
    name: '',
    phone: '',
    email: '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    status: 'pending'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [originalBookingData, setOriginalBookingData] = useState<any>(null);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  // Transform API data to form data - based on BookingItem interface
  const transformApiDataToFormData = (apiData: BookingItem): EditBookingData => {
    const { date, time } = formatDateForInput(apiData.appointmentDate);
    
    // Map collectionMethod to serviceType
    let serviceType: 'home' | 'clinic' = 'home';
    if (apiData.collectionMethod) {
      const method = apiData.collectionMethod.toLowerCase();
      if (method.includes('clinic') || method.includes('center') || method.includes('trung tâm')) {
        serviceType = 'clinic';
      } else if (method.includes('home') || method.includes('nhà') || method.includes('kit')) {
        serviceType = 'home';
      }
    }
    
    return {
      id: apiData.id || '',
      testType: getTestTypeFromCollectionMethod(apiData.collectionMethod) || 'Unknown Service',
      serviceType: serviceType,
      name: apiData.clientName || '',
      phone: apiData.phone || '',
      email: apiData.email || '',
      address: apiData.address || '',
      preferredDate: date,
      preferredTime: time,
      notes: apiData.note || '',
      status: mapApiStatusToUIStatus(apiData.status)
    };
  };

  // Helper function to map API status to UI status
  const mapApiStatusToUIStatus = (apiStatus: string): EditBookingData['status'] => {
    const status = apiStatus.toLowerCase();
    
    switch (status) {
      case 'pending':
      case 'chờ xử lý':
        return 'pending';
      case 'confirmed':
      case 'đã xác nhận':
        return 'confirmed';
      case 'in_progress':
      case 'đang thực hiện':
        return 'in_progress';
      case 'completed':
      case 'hoàn thành':
        return 'completed';
      case 'cancelled':
      case 'đã hủy':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  // Helper function to get test type from collection method
  const getTestTypeFromCollectionMethod = (collectionMethod: string): string => {
    if (!collectionMethod) return 'Unknown Service';
    
    const method = collectionMethod.toLowerCase();
    
    if (method.includes('dân sự') || method.includes('civil')) {
      if (method.includes('kit') || method.includes('tự thu')) {
        return 'ADN Dân Sự - Tự Thu Mẫu (Kit)';
      } else if (method.includes('nhà') || method.includes('home')) {
        return 'ADN Dân Sự - Thu Tại Nhà';
      } else if (method.includes('trung tâm') || method.includes('center') || method.includes('clinic')) {
        return 'ADN Dân Sự - Thu Tại Trung Tâm';
      }
    } else if (method.includes('hành chính') || method.includes('legal')) {
      if (method.includes('hài cốt') || method.includes('bone')) {
        return 'ADN Hành Chính - Giám Định Hài Cốt';
      } else {
        return 'ADN Hành Chính - Thu Tại Trung Tâm';
      }
    }
    
    // Fallback: return the original collection method
    return collectionMethod;
  };

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) {
        setApiError("ID đặt lịch không hợp lệ");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setApiError(null);

      try {
        console.log('🔄 Fetching booking data for ID:', bookingId);
        const bookingData = await getBookingByIdApi(bookingId);
        
        if (!bookingData) {
          throw new Error('Không tìm thấy thông tin đặt lịch');
        }
        
        console.log('✅ Received booking data:', bookingData);
        setOriginalBookingData(bookingData);
        
        const transformedData = transformApiDataToFormData(bookingData);
        console.log('📋 Transformed to form data:', transformedData);
        
        setFormData(transformedData);
      } catch (error) {
        console.error('❌ Failed to fetch booking data:', error);
        setApiError(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải thông tin đặt lịch");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId]);

  const handleInputChange = (field: keyof EditBookingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.serviceType === 'home' && !formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ nhận kit';
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Vui lòng chọn ngày hẹn';
    } else {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.preferredDate = 'Ngày hẹn không thể trong quá khứ';
      }
    }

    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Vui lòng chọn thời gian hẹn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!bookingId) {
      setApiError("ID đặt lịch không hợp lệ");
      return;
    }

    setIsSaving(true);
    setApiError(null);
    
    try {
      console.log('🚀 Starting update process...');
      
      // Map form data to API request format
      const updateRequest = mapFormDataToUpdateRequest(
        bookingId,
        {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          notes: formData.notes,
        },
        formData.status
      );
      
      console.log('📤 Sending update request:', updateRequest);
      
      // Call update API
      const result = await updateBookingApi(updateRequest);
      
      console.log('✅ Update successful:', result);
      
      // Show success message
      setShowSuccess(true);
      
      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate(`/customer/booking-detail/${bookingId}`);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error updating booking:', error);
      
      // Handle specific error messages
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
          setApiError("Bạn cần đăng nhập để cập nhật thông tin. Vui lòng đăng nhập và thử lại.");
        } else if (errorMessage.includes('Access denied') || errorMessage.includes('403')) {
          setApiError("Bạn không có quyền cập nhật đặt lịch này.");
        } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
          setApiError("Không tìm thấy đặt lịch này. Có thể đặt lịch đã bị xóa hoặc không tồn tại.");
        } else if (errorMessage.includes('Invalid data') || errorMessage.includes('400')) {
          setApiError(`Dữ liệu không hợp lệ: ${errorMessage.split(':')[1] || 'Vui lòng kiểm tra lại thông tin đã nhập.'}`);
        } else if (errorMessage.includes('Validation failed')) {
          setApiError(`Lỗi validate: ${errorMessage.split(':')[1] || 'Vui lòng kiểm tra lại thông tin đã nhập.'}`);
        } else {
          setApiError(`Lỗi cập nhật: ${errorMessage}`);
        }
      } else {
        setApiError("Đã xảy ra lỗi không xác định khi cập nhật đặt lịch. Vui lòng thử lại.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-[#fcfefe] to-gray-50 min-h-screen w-full">
        <div className="relative z-50">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError && !formData.id) {
    return (
      <div className="bg-gradient-to-b from-[#fcfefe] to-gray-50 min-h-screen w-full">
        <div className="relative z-50">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto">
            <AlertCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-red-600 mb-2">Có lỗi xảy ra</h3>
            <p className="text-slate-600 mb-6">{apiError}</p>
            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                Thử lại
              </Button>
              <Button
                onClick={() => navigate('/customer/booking-list')}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Quay về danh sách
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="bg-gradient-to-b from-[#fcfefe] to-gray-50 min-h-screen w-full">
        <div className="relative z-50">
          <Header />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-600 mb-2">Cập nhật thành công!</h3>
            <p className="text-slate-600 mb-6">
              Thông tin đặt lịch đã được cập nhật. Đang chuyển hướng...
            </p>
            <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplayInfo(formData.status);
  
  return (
    <div className="bg-gradient-to-b from-[#fcfefe] to-gray-50 min-h-screen w-full">
      <div className="relative w-full max-w-none">
        {/* Header */}
        <div className="relative z-50">
          <Header />
        </div>

        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-28 bg-blue-50 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,50 C25,80 75,20 100,50 L100,100 L0,100 Z" fill="#1e40af"/></svg>
          </div>
          <div className="relative z-10 container px-4 mx-auto md:px-6 lg:px-8 max-w-7xl">
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="/" className="text-blue-600 hover:text-blue-800">Trang Chủ</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink href="/customer/booking-list" className="text-blue-600 hover:text-blue-800">Tài khoản của tôi</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><span className="font-semibold text-blue-900">Chỉnh Sửa Lịch Hẹn</span></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <h1 className="mb-4 text-4xl font-bold leading-tight text-blue-900 md:text-5xl lg:text-6xl">Chỉnh Sửa Lịch Hẹn
              <span className="block mt-2 text-2xl font-medium text-blue-700 md:text-3xl">
                Cập nhật thông tin cho đơn hẹn #{formData.id.slice(-6)}
              </span>
            </h1>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl py-12">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Thông Tin Lịch Hẹn</h2>
                  <p className="text-white/80">Cập nhật thông tin chi tiết cho lịch hẹn của bạn.</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${statusDisplay.color}`}>
                  <statusDisplay.icon className="w-4 h-4" />
                  {statusDisplay.label}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">

              {/* API Error Display */}
              {apiError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-center">
                    <AlertCircleIcon className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <p className="font-semibold text-red-800">Đã có lỗi xảy ra</p>
                      <p className="text-red-700">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Form Fields */}
                <div className="md:col-span-2">
                  <label className="font-semibold text-gray-700">Dịch vụ</label>
                  <p className="text-lg text-blue-800 font-medium mt-1">{formData.testType}</p>
                </div>

                <div>
                  <label htmlFor="name" className="font-semibold text-gray-700">Họ và tên</label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1"
                    icon={<UserIcon />}
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="font-semibold text-gray-700">Số điện thoại</label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1"
                    icon={<PhoneIcon />}
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="font-semibold text-gray-700">Email</label>
                  <Input 
                    id="email" 
                    value={formData.email}
                    readOnly
                    className="mt-1 bg-gray-100 cursor-not-allowed"
                    icon={<MailIcon />}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="font-semibold text-gray-700">Địa chỉ lấy mẫu (nếu tại nhà)</label>
                  <Input 
                    id="address" 
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="mt-1"
                    icon={<MapPinIcon />}
                  />
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label htmlFor="preferredDate" className="font-semibold text-gray-700">Ngày hẹn</label>
                  <Input 
                    id="preferredDate" 
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    className="mt-1"
                  />
                  {errors.preferredDate && <p className="text-red-600 text-sm mt-1">{errors.preferredDate}</p>}
                </div>

                <div>
                  <label htmlFor="preferredTime" className="font-semibold text-gray-700">Giờ hẹn</label>
                   <select
                    id="preferredTime"
                    value={formData.preferredTime}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn giờ hẹn</option>
                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                  {errors.preferredTime && <p className="text-red-600 text-sm mt-1">{errors.preferredTime}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="notes" className="font-semibold text-gray-700">Ghi chú</label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md min-h-[80px] focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Thêm ghi chú cho lịch hẹn (nếu có)..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button 
                  onClick={() => navigate('/customer/booking-list')}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button 
                  onClick={handleSave}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
        </main>
        
        <div className="relative">
          <Footer />
        </div>
      </div>
    </div>
  );
}; 