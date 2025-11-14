/**
 * API Types for AshiD Diamonds Integration
 * Based on Swagger API specification from https://aichatbotbeta.ashidiamonds.com/swagger/
 */

// Base API Response Structure
export interface IApiResponse<T = any> {
  responseCode: number;
  responseStatus: string;
  responseMessage: string;
  responseData: T;
}

// Authentication Types
export interface ILoginRequest {
  jewelerid: string;
  userName: string;
  password: string;
  jewelsoftid?: string;
}

export interface ILoginResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  userInfo?: {
    jewelerid: string;
    userName: string;
    jewelsoftid?: string;
  };
}

// Product Types (Updated to match real AshiD API structure)
export interface IProduct {
  productid: number;
  shortdesc: string;
  itemcd: string; // This is the actual style_id
  isnewitem: number;
  istopselleritem: number;
  isoverstockitem: number;
  MOB_SHORT_DESC: string;
  ITEM_SIZE_DEFAULT: string;
  In_Stock: string;
  Stock_Message: string;
  price: number;
  sprice: number;
  attribgroups: any[];
  pictures: IPicture[];
  category?: string;
  brand?: string;
}

export interface IPicture {
  pictureurl: string;
  picid: number;
  picorder: number;
  viewname: string;
  displaytype: string;
  pictypeid: string;
  imagetype: string;
}

export interface IProductSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IProductSearchResponse {
  products: IProduct[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface IProductDetails extends IProduct {
  variants?: IProductVariant[];
  specifications?: Record<string, any>;
  images?: string[];
  availability?: boolean;
}

export interface IProductVariant {
  variantId: string;
  style_id: string;
  size?: string;
  color?: string;
  price?: number;
  availability?: boolean;
  specifications?: Record<string, any>;
}

// Cart Types
export interface ICartItem {
  id: string;
  style_id: string;
  variantId?: string;
  quantity: number;
  price: number;
  product?: IProduct;
}

export interface IAddToCartRequest {
  style_id: string;
  variantId?: string;
  quantity: number;
  specifications?: Record<string, any>;
}

export interface ICart {
  items: ICartItem[];
  totalItems: number;
  totalAmount: number;
  subtotal: number;
  tax?: number;
  shipping?: number;
}

export interface IPlaceOrderRequest {
  shippingAddress?: any;
  billingAddress?: any;
  paymentMethod?: string;
  notes?: string;
}

export interface IOrder {
  orderId: string;
  orderNumber: string;
  status: string;
  items: ICartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Sales Quotation Types
export interface IQuotation {
  quotationId: string;
  quotationNumber: string;
  items: IQuotationItem[];
  totalAmount: number;
  status: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IQuotationItem {
  id: string;
  style_id: string;
  quantity: number;
  price: number;
  product?: IProduct;
}

export interface ICreateQuotationRequest {
  customerName?: string;
  customerEmail?: string;
  notes?: string;
  validityDays?: number;
}

export interface IAddQuotationItemRequest {
  quotationId: string;
  style_id: string;
  quantity: number;
  specifications?: Record<string, any>;
}

// Wishlist Types
export interface IWishlistItem {
  id: string;
  style_id: string;
  product?: IProduct;
  addedAt: string;
}

export interface IWishlist {
  items: IWishlistItem[];
  totalItems: number;
}

export interface IAddToWishlistRequest {
  style_id: string;
  notes?: string;
}

// Special Order Types
export interface ISpecialOrderOptions {
  availableOptions: Record<string, any>;
  customizations: string[];
  leadTime?: string;
  additionalCost?: number;
}

export interface ISpecialOrderVariant {
  variantId: string;
  available: boolean;
  leadTime?: string;
  additionalCost?: number;
  specifications?: Record<string, any>;
}

// Chat/Messaging Types (for future AI integration)
export interface IChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    products?: IProduct[];
    orders?: IOrder[];
    quotations?: IQuotation[];
  };
}

export interface IChatSession {
  sessionId: string;
  messages: IChatMessage[];
  context?: {
    currentProducts?: IProduct[];
    currentCart?: ICart;
    userPreferences?: Record<string, any>;
  };
}

// Error Types
export interface IApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Pagination Types
export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// API Client Configuration
export interface IApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

// Authentication State
export interface IAuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  userInfo: any | null;
}

// ===== MISSING API TYPES FROM SWAGGER =====

// Related Products Types
export interface IRelatedProduct {
  itemcd: string;
  productid: number;
  shortdesc: string;
  price: number;
  relationship_type: string; // 'similar', 'complementary', 'alternative'
  confidence_score?: number;
}

// Product Measurement Types
export interface IProductMeasurement {
  itemcd: string;
  measurements: Record<string, string | number>;
  jewelry_type: string;
  size_chart?: Record<string, any>;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    weight?: number;
    unit?: string;
  };
}

// Style History Types
export interface IStyleHistory {
  itemcd: string;
  purchase_history: IPurchaseRecord[];
  memo_history: IMemoRecord[];
  invoice_history: IInvoiceRecord[];
}

export interface IPurchaseRecord {
  date: string;
  type: 'memo' | 'invoice';
  reference_no: string;
  quantity: number;
  price: number;
  customer_info?: any;
}

export interface IMemoRecord {
  memo_no: string;
  date: string;
  customer: string;
  quantity: number;
  status: string;
}

export interface IInvoiceRecord {
  invoice_no: string;
  date: string;
  customer: string;
  quantity: number;
  amount: number;
  status: string;
}

// Inventory Status Types
export interface IInventoryStatusRequest {
  style_ids: string[];
}

export interface IInventoryStatus {
  itemcd: string;
  in_stock: boolean;
  quantity_available: number;
  stock_message: string;
  lead_time?: string;
  last_updated: string;
}

// Similar Styles Types
export interface ISimilarStyle {
  itemcd: string;
  productid: number;
  shortdesc: string;
  price: number;
  similarity_score: number;
  shared_attributes: string[];
  pictures: IPicture[];
}

// Recently Viewed Types
export interface IRecentlyViewed {
  itemcd: string;
  productid: number;
  shortdesc: string;
  price: number;
  viewed_at: string;
  pictures: IPicture[];
}

// Custom Quote Types (Extended)
export interface ICustomQuote {
  quote_id: string;
  customer_info: ICustomerInfo;
  specifications: ICustomQuoteSpecifications;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  updated_at: string;
  estimated_price?: number;
  estimated_lead_time?: string;
}

export interface ICustomQuoteSpecifications {
  base_style_id?: string;
  jewelry_type: string;
  metal_type: string;
  metal_karat?: string;
  metal_color?: string;
  gemstone_type?: string;
  gemstone_size?: string;
  gemstone_quality?: string;
  setting_style?: string;
  engraving?: string;
  custom_requirements?: string;
  design_files?: string[];
}

export interface ICustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: IAddress;
  preferences?: Record<string, any>;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// Order Status Types
export interface IOrderStatusRequest {
  webreference_no?: string;
  po_no?: string;
  ashi_order_no?: string;
  order_status?: string;
  start_date?: string;
  end_date?: string;
}

export interface IOrderStatus {
  order_no: string;
  po_no?: string;
  webreference_no?: string;
  ashi_order_no?: string;
  status: string;
  order_date: string;
  ship_date?: string;
  tracking_no?: string;
  items: IOrderStatusItem[];
  total_amount: number;
  customer_info: ICustomerInfo;
}

export interface IOrderStatusItem {
  itemcd: string;
  productid: number;
  shortdesc: string;
  quantity: number;
  price: number;
  status: string;
  tracking_info?: string;
}

// Catalog/Program Types
export interface IProgramInfo {
  ppcc_id: string;
  program_name: string;
  catalog_info: ICatalogInfo;
  spo_info: ISpecialOrderInfo;
  products: IProduct[];
}

export interface ICatalogInfo {
  catalog_id: string;
  catalog_name: string;
  description: string;
  effective_date: string;
  expiry_date?: string;
}

export interface ISpecialOrderInfo {
  spo_enabled: boolean;
  spo_options: string[];
  lead_time: string;
  additional_cost_percentage: number;
}

// Email Types (Limited from Swagger)
export interface IEmailStyleDetailsFields {
  fields: IEmailField[];
  template_info: IEmailTemplateInfo;
}

export interface IEmailField {
  field_name: string;
  field_type: string;
  required: boolean;
  default_value?: any;
  options?: string[];
}

export interface IEmailTemplateInfo {
  template_id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
}

export interface IEmailStyleDetailsRequest {
  itemcd: string;
  recipient_email: string;
  sender_name?: string;
  sender_email?: string;
  personal_message?: string;
  template_variables?: Record<string, any>;
}

// Cart Additional Types (from Swagger)
export interface IPlaceOrderFields {
  required_fields: IOrderField[];
  optional_fields: IOrderField[];
  field_groups: IFieldGroup[];
}

export interface IOrderField {
  field_name: string;
  field_type: string;
  label: string;
  required: boolean;
  validation_rules?: IValidationRule[];
  default_value?: any;
  options?: IFieldOption[];
}

export interface IFieldGroup {
  group_name: string;
  group_label: string;
  fields: string[];
  order: number;
}

export interface IValidationRule {
  rule_type: string;
  rule_value: any;
  error_message: string;
}

export interface IFieldOption {
  value: any;
  label: string;
  selected?: boolean;
}

export interface IPlaceOrderFieldsRequest {
  field_values: Record<string, any>;
  validate_only?: boolean;
}

// Special Order Additional Types
export interface ISpecialOrderCartItem {
  itemcd: string;
  quantity: number;
  specifications: ICustomQuoteSpecifications;
  estimated_price?: number;
  estimated_lead_time?: string;
  special_instructions?: string;
}

// Sales Quotation Additional Types  
export interface ISpecificQuotation {
  quotation_id: string;
  quotation_name: string;
  quotation_code: string;
  customer_info: ICustomerInfo;
  items: IQuotationItem[];
  status: string;
  created_date: string;
  valid_until: string;
  total_amount: number;
  notes?: string;
}

// Internal User API Types (replaces direct Freshchat user creation)
export interface IInternalUserRequest {
  user_email: string;
  org_id: string;
  user_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  reference_id: string;
}

export interface IInternalUserResponse {
  success: boolean;
  user_id?: string;
  freshchat_user_id?: string;
  message: string;
  user_data?: any;
  error_details?: any;
}

// Session API Types
export interface ICreateSessionRequest {
  user_id: string;
  auth_token: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface ICreateSessionResponse {
  success: boolean;
  session_id?: string;
  message: string;
  session_data?: any;
  error_details?: any;
}

// Chat API Types
export interface IChatRequest {
  message: string;
  user_id: string;
  session_id: string;
  stream?: boolean;
  auth_token: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface IChatAgentState {
  messages: IChatStateMessage[];
  user_id: string;
  session_id: string;
  auth_token: string;
  conversation_id: string;
  conversation_context: {
    conversation_id: string;
    session_data: {
      session_id: string;
      user_id: string;
      user_name: string;
      user_email: string;
      status: string;
      billing_session_count: number;
      expires_at: string;
      created_at: string;
      updated_at: string;
      metadata: {
        auth_token: string;
        [key: string]: any;
      };
    };
    freshchat_conversation_id: string;
    last_response_timestamp: string;
    model_used: string;
  };
  display_items: {
    [key: string]: any;
  };
  handoff_to_human: boolean;
}

export interface IChatStateMessage {
  content: string;
  additional_kwargs: any;
  response_metadata: any;
  type: 'human' | 'ai' | 'system';
  name: string | null;
  id: string;
  example: boolean;
  tool_calls?: any[];
  invalid_tool_calls?: any[];
  usage_metadata?: any;
}

export interface IChatResponse {
  response: string;
  display_items: {
    [key: string]: any;
  };
  handoff_to_human: boolean;
  session_id: string;
  conversation_id: string;
  user_id: string;
  billing_session_count: number;
  is_new_session: boolean;
  timestamp: string;
  metadata: {
    freshchat_conversation_id: string;
    agent_state: IChatAgentState;
    [key: string]: any;
  };
}

// Chat State Management Types
export interface IConversationMapping {
  session_id: string;
  conversation_id: string;
  freshchat_conversation_id: string;
  user_id: string;
  handoff_to_human: boolean;
  created_at: string;
  updated_at: string;
  last_message_timestamp?: string;
}

// Authentication & Login Types
export interface ILoginFormData {
  jewelerid: string;
  userName: string;
  password: string;
}

// Enhanced User Details for Registration
export interface IUserDetailsFormData {
  // Login credentials
  jewelerid: string;
  userName: string; // This will be the email
  password: string;
  
  // User details for createUser API
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  reference_id?: string; // Will be auto-generated as firstname@lastname if not provided
}

// Combined Authentication Form Data
export interface ICompleteLoginFormData extends IUserDetailsFormData {
  // Inherits all fields from IUserDetailsFormData
  // Additional fields can be added here if needed
}

export interface IAuthenticationState {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  loginError: string | null;
  lastLoginAttempt?: string;
  loginSuccess?: boolean;
}

export interface IStoredAuthCredentials {
  jewelerid: string;
  userName: string;
  // Note: Password should never be stored in localStorage for security
  lastLogin: string;
  loginCount: number;
  hostTokens?: {
    [key: string]: string;
  };
  sessionInfo?: {
    sessionId?: string;
    userId?: string;
    authToken?: string;
  };
}

export interface IHostTokens {
  host_auth_token?: string;
  api_key?: string;
  session_token?: string;
  refresh_token?: string;
  [key: string]: string | undefined;
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  data?: {
    user_id?: string;
    session_id?: string;
    auth_token?: string;
    host_tokens?: IHostTokens;
    user_info?: {
      jewelerid: string;
      userName: string;
      email?: string;
      permissions?: string[];
    };
  };
  error_details?: any;
}

// Complete Authentication Flow Types
export interface ICompleteAuthFlow {
  step: 'login' | 'create_user' | 'create_session' | 'complete' | 'error';
  success: boolean;
  message: string;
  data?: {
    // Login step data
    login_response?: ILoginResponse;
    host_tokens?: IHostTokens;
    
    // User creation step data
    user_id?: string;
    freshchat_user_id?: string;
    
    // Session creation step data
    session_id?: string;
    auth_token?: string;
    
    // Complete flow data
    complete_auth_data?: ICompleteAuthData;
  };
  error_details?: any;
}

export interface ICompleteAuthData {
  // Authentication info
  jewelerid: string;
  userName: string;
  isAuthenticated: boolean;
  
  // Host tokens
  host_auth_token: string;
  host_tokens: IHostTokens;
  
  // User info
  user_id: string;
  freshchat_user_id: string;
  
  // Session info
  session_id: string;
  auth_token: string;
  
  // Timestamps
  login_timestamp: string;
  user_created_timestamp: string;
  session_created_timestamp: string;
  
  // Metadata
  login_count: number;
  flow_version: string;
}

// Legacy Freshchat API Types (kept for backward compatibility)
export interface IFreshchatUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  reference_id: string;
  jeweler_id: string;
}

export interface IFreshchatProperty {
  name: string;
  value: string;
}

export interface IFreshchatAPIPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  reference_id: string;
  properties: IFreshchatProperty[];
}

export interface IFreshchatUserResponse {
  success: boolean;
  freshchat_user_id?: string;
  message: string;
  user_data?: any;
  error_details?: any;
}

export interface IFreshchatUser {
  id: string;
  created_time: string;
  updated_time: string;
  avatar?: {
    url?: string;
  };
  email: string;
  first_name: string;
  last_name: string;
  login_status: boolean;
  phone?: string;
  reference_id: string;
  restore_id?: string;
  properties?: IFreshchatProperty[];
}

export interface IFreshchatUsersResponse {
  users: IFreshchatUser[];
}

// Freshchat Conversation and Message Types
export interface IFreshchatMessagePart {
  text?: {
    content: string;
  };
}

export interface IFreshchatQuickReplyButton {
  quick_reply_button: {
    label: string;
  };
}

export interface IFreshchatUrlButton {
  url_button: {
    url: string;
    label: string;
    target: '_blank' | '_self';
  };
}

export interface IFreshchatReplyPart {
  collection: {
    sub_parts: (IFreshchatQuickReplyButton | IFreshchatUrlButton)[];
  };
}

export interface IFreshchatSendMessageRequest {
  message_parts: IFreshchatMessagePart[];
  reply_parts?: IFreshchatReplyPart[];
  message_type: 'normal' | 'private_note';
  actor_type: 'agent' | 'user' | 'system';
  user_id: string;
  actor_id: string;
}

export interface IFreshchatMessage {
  message_parts: IFreshchatMessagePart[];
  app_id: string;
  actor_id: string;
  org_actor_id: string;
  id: string;
  channel_id: string;
  conversation_id: string;
  interaction_id: string;
  message_type: string;
  actor_type: string;
  created_time: string;
  user_id: string;
  restrictResponse: boolean;
  botsPrivateNote: boolean;
}

export interface IFreshchatConversation {
  conversation_id: string;
  channel_id: string;
  assigned_org_agent_id: string;
  assigned_agent_id: string;
  assigned_org_group_id: string;
  assigned_group_id: string;
  messages: IFreshchatMessage[];
  app_id: string;
  status: string;
  skill_id: number;
  properties: {
    priority: string;
    cf_type: string;
    cf_rating: string;
    [key: string]: any;
  };
  users: Array<{
    id: string;
  }>;
}

export interface IFreshchatSendMessageResponse {
  success: boolean;
  message_id?: string;
  message: string;
  message_data?: any;
  error_details?: any;
}

export interface IFreshchatGetConversationResponse {
  success: boolean;
  message: string;
  conversation_data?: IFreshchatConversation;
  error_details?: any;
}