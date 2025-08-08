--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.account_categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    code character varying NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.account_categories OWNER TO neondb_owner;

--
-- Name: appointment_actions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointment_actions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    appointment_id character varying NOT NULL,
    doctor_id character varying NOT NULL,
    action_type character varying NOT NULL,
    notes text,
    action_date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appointment_actions OWNER TO neondb_owner;

--
-- Name: appointment_prescriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointment_prescriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    appointment_id character varying NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id character varying NOT NULL,
    prescription_code character varying NOT NULL,
    medications jsonb NOT NULL,
    diagnosis text,
    symptoms text,
    treatment_plan text,
    follow_up_date date,
    status character varying DEFAULT 'active'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appointment_prescriptions OWNER TO neondb_owner;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.appointments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying NOT NULL,
    customer_id character varying,
    store_id character varying NOT NULL,
    staff_id character varying,
    assigned_doctor_id character varying,
    appointment_date timestamp without time zone NOT NULL,
    duration integer DEFAULT 60,
    service character varying NOT NULL,
    appointment_fee numeric(10,2),
    payment_status character varying DEFAULT 'pending'::character varying,
    payment_method character varying,
    payment_date timestamp without time zone,
    status character varying DEFAULT 'scheduled'::character varying,
    priority character varying DEFAULT 'normal'::character varying,
    notes text,
    doctor_notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appointments OWNER TO neondb_owner;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_id uuid NOT NULL,
    store_id character varying,
    date date NOT NULL,
    check_in_time timestamp without time zone,
    check_out_time timestamp without time zone,
    total_hours numeric(5,2),
    check_in_method character varying(20) DEFAULT 'manual'::character varying,
    check_out_method character varying(20) DEFAULT 'manual'::character varying,
    check_in_location jsonb,
    check_out_location jsonb,
    status character varying(20) DEFAULT 'present'::character varying,
    is_late boolean DEFAULT false,
    late_minutes integer DEFAULT 0,
    notes text,
    qr_code text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.attendance OWNER TO neondb_owner;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: chart_of_accounts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chart_of_accounts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    account_number character varying NOT NULL,
    account_name character varying NOT NULL,
    category_id character varying NOT NULL,
    parent_account_id character varying,
    account_type character varying NOT NULL,
    sub_type character varying,
    normal_balance character varying NOT NULL,
    is_active boolean DEFAULT true,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chart_of_accounts OWNER TO neondb_owner;

--
-- Name: communication_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.communication_log (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    customer_id character varying,
    type character varying NOT NULL,
    recipient character varying NOT NULL,
    subject character varying,
    message text NOT NULL,
    status character varying DEFAULT 'sent'::character varying,
    sent_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.communication_log OWNER TO neondb_owner;

--
-- Name: custom_fields_config; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.custom_fields_config (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying NOT NULL,
    field_name character varying NOT NULL,
    field_type character varying NOT NULL,
    field_options jsonb,
    is_required boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.custom_fields_config OWNER TO neondb_owner;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    email character varying,
    phone character varying,
    date_of_birth date,
    address text,
    city character varying,
    state character varying,
    zip_code character varying,
    loyalty_points integer DEFAULT 0,
    loyalty_tier character varying DEFAULT 'Bronze'::character varying,
    notes text,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: doctors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.doctors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    doctor_code character varying(20) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    specialization character varying(100),
    license_number character varying(50),
    phone character varying(20),
    email character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.doctors OWNER TO neondb_owner;

--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_templates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    subject character varying NOT NULL,
    body text NOT NULL,
    template_type character varying NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.email_templates OWNER TO neondb_owner;

--
-- Name: general_ledger_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.general_ledger_entries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    transaction_id character varying NOT NULL,
    account_id character varying NOT NULL,
    transaction_date timestamp without time zone NOT NULL,
    posting_date timestamp without time zone DEFAULT now(),
    description text NOT NULL,
    reference_type character varying NOT NULL,
    reference_id character varying NOT NULL,
    debit_amount numeric(15,2) DEFAULT '0'::numeric,
    credit_amount numeric(15,2) DEFAULT '0'::numeric,
    running_balance numeric(15,2) DEFAULT '0'::numeric,
    fiscal_year integer NOT NULL,
    fiscal_period integer NOT NULL,
    is_reversed boolean DEFAULT false,
    reversal_transaction_id character varying,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.general_ledger_entries OWNER TO neondb_owner;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    product_id character varying,
    product_name character varying(255) NOT NULL,
    description text,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    discount numeric(5,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoice_items OWNER TO neondb_owner;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number character varying(20) NOT NULL,
    customer_id character varying,
    store_id character varying NOT NULL,
    date timestamp without time zone DEFAULT now(),
    due_date date,
    subtotal numeric(10,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT '0'::numeric,
    tax_amount numeric(10,2) DEFAULT '0'::numeric,
    discount_amount numeric(10,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying,
    payment_method character varying(20),
    payment_date timestamp without time zone,
    notes text,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    applied_coupon_code character varying,
    coupon_discount_amount numeric(10,2) DEFAULT 0,
    service_type character varying,
    coupon_discount numeric(10,2) DEFAULT 0,
    coupon_type character varying,
    coupon_description text,
    source character varying(50)
);


ALTER TABLE public.invoices OWNER TO neondb_owner;

--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.leave_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    leave_number character varying(20) NOT NULL,
    staff_id uuid NOT NULL,
    manager_id uuid,
    leave_type character varying(50) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    applied_date timestamp without time zone DEFAULT now(),
    reviewed_date timestamp without time zone,
    review_comments text,
    attachments jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.leave_requests OWNER TO neondb_owner;

--
-- Name: medical_appointments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medical_appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_number character varying(20) NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    store_id character varying,
    appointment_date timestamp without time zone NOT NULL,
    appointment_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'scheduled'::character varying,
    notes text,
    symptoms text,
    diagnosis text,
    treatment text,
    next_follow_up date,
    duration integer DEFAULT 30,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.medical_appointments OWNER TO neondb_owner;

--
-- Name: medical_interventions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medical_interventions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    duration integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.medical_interventions OWNER TO neondb_owner;

--
-- Name: medical_invoice_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medical_invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    item_type character varying(50) NOT NULL,
    item_id uuid,
    item_name character varying(255) NOT NULL,
    description text,
    quantity integer DEFAULT 1,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.medical_invoice_items OWNER TO neondb_owner;

--
-- Name: medical_invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.medical_invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number character varying(20) NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    appointment_id uuid,
    prescription_id uuid,
    store_id character varying,
    invoice_date timestamp without time zone DEFAULT now(),
    due_date date,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric,
    discount_amount numeric(10,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(20),
    payment_date timestamp without time zone,
    notes text,
    qr_code character varying(255),
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    applied_coupon_code character varying(255)
);


ALTER TABLE public.medical_invoices OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid,
    recipient_type character varying(20) DEFAULT 'staff'::character varying,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    priority character varying(20) DEFAULT 'normal'::character varying,
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    sent_at timestamp without time zone DEFAULT now(),
    related_type character varying(50),
    related_id uuid,
    related_data jsonb,
    channels jsonb DEFAULT '["app"]'::jsonb,
    delivery_status jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: patient_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.patient_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    record_type character varying(50) NOT NULL,
    record_id uuid NOT NULL,
    record_date timestamp without time zone DEFAULT now(),
    title character varying(255) NOT NULL,
    description text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.patient_history OWNER TO neondb_owner;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.patients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_code character varying(20) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    date_of_birth date,
    gender character varying(10),
    phone character varying(20),
    email character varying(255),
    address text,
    emergency_contact character varying(100),
    emergency_phone character varying(20),
    blood_group character varying(5),
    allergies text,
    medical_history text,
    insurance_provider character varying(100),
    insurance_number character varying(50),
    current_medications text,
    previous_eye_conditions text,
    last_eye_exam_date date,
    current_prescription character varying(200),
    risk_factors character varying(20) DEFAULT 'low'::character varying,
    family_medical_history text,
    smoking_status character varying(20),
    alcohol_consumption character varying(20),
    exercise_frequency character varying(20),
    right_eye_sphere character varying(10),
    right_eye_cylinder character varying(10),
    right_eye_axis character varying(10),
    left_eye_sphere character varying(10),
    left_eye_cylinder character varying(10),
    left_eye_axis character varying(10),
    pupillary_distance character varying(10),
    doctor_notes text,
    treatment_plan text,
    follow_up_date date,
    medical_alerts text,
    is_active boolean DEFAULT true,
    loyalty_tier character varying(20) DEFAULT 'bronze'::character varying,
    loyalty_points integer DEFAULT 0,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    username character varying(255),
    password character varying(255),
    national_id character varying(50),
    nis_number character varying(50),
    insurance_coupons jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.patients OWNER TO neondb_owner;

--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payment_transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    transaction_number character varying NOT NULL,
    transaction_type character varying NOT NULL,
    source_type character varying NOT NULL,
    source_id character varying NOT NULL,
    customer_id character varying,
    payer_id character varying,
    payer_name character varying NOT NULL,
    payer_type character varying NOT NULL,
    amount numeric(15,2) NOT NULL,
    currency character varying DEFAULT 'USD'::character varying,
    payment_method character varying NOT NULL,
    payment_processor character varying,
    processor_transaction_id character varying,
    bank_account character varying,
    check_number character varying,
    status character varying DEFAULT 'completed'::character varying,
    description text,
    notes text,
    fee_amount numeric(10,2) DEFAULT '0'::numeric,
    net_amount numeric(15,2) NOT NULL,
    transaction_date timestamp without time zone NOT NULL,
    processed_date timestamp without time zone,
    reconciled_date timestamp without time zone,
    is_reconciled boolean DEFAULT false,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.payment_transactions OWNER TO neondb_owner;

--
-- Name: payroll; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payroll (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    payroll_number character varying(20) NOT NULL,
    staff_id uuid NOT NULL,
    pay_period character varying(20) NOT NULL,
    pay_month integer NOT NULL,
    pay_year integer NOT NULL,
    pay_date date,
    basic_salary numeric(10,2) NOT NULL,
    allowances jsonb DEFAULT '{}'::jsonb,
    deductions jsonb DEFAULT '{}'::jsonb,
    overtime numeric(10,2) DEFAULT '0'::numeric,
    bonus numeric(10,2) DEFAULT '0'::numeric,
    gross_salary numeric(10,2) NOT NULL,
    total_deductions numeric(10,2) DEFAULT '0'::numeric,
    net_salary numeric(10,2) NOT NULL,
    working_days integer NOT NULL,
    present_days integer NOT NULL,
    absent_days integer DEFAULT 0,
    leaves_taken integer DEFAULT 0,
    status character varying(20) DEFAULT 'pending'::character varying,
    processed_by uuid,
    processed_date timestamp without time zone,
    payslip_generated boolean DEFAULT false,
    payslip_url character varying(500),
    qr_code text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.payroll OWNER TO neondb_owner;

--
-- Name: prescription_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prescription_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prescription_id uuid NOT NULL,
    product_id character varying,
    item_type character varying(50) NOT NULL,
    item_name character varying(255) NOT NULL,
    quantity integer DEFAULT 1,
    unit_price numeric(10,2),
    total_price numeric(10,2),
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prescription_items OWNER TO neondb_owner;

--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prescriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    prescription_number character varying(20) NOT NULL,
    patient_id uuid NOT NULL,
    doctor_id uuid,
    appointment_id character varying,
    store_id character varying,
    prescription_date timestamp without time zone DEFAULT now(),
    prescription_type character varying(50) NOT NULL,
    visual_acuity_right_eye character varying(20),
    visual_acuity_left_eye character varying(20),
    sphere_right numeric(4,2),
    cylinder_right numeric(4,2),
    axis_right integer,
    add_right numeric(4,2),
    sphere_left numeric(4,2),
    cylinder_left numeric(4,2),
    axis_left integer,
    add_left numeric(4,2),
    pd_distance numeric(4,1),
    pd_near numeric(4,1),
    pd_far numeric(4,1),
    diagnosis text,
    treatment text,
    advice text,
    next_follow_up date,
    notes text,
    custom_fields jsonb,
    status character varying(20) DEFAULT 'active'::character varying,
    qr_code character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prescriptions OWNER TO neondb_owner;

--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    sku character varying NOT NULL,
    category_id character varying,
    supplier_id character varying,
    price numeric(10,2) NOT NULL,
    cost_price numeric(10,2),
    product_type character varying DEFAULT 'frames'::character varying,
    reorder_level integer DEFAULT 10,
    is_active boolean DEFAULT true,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    barcode text
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: profit_loss_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.profit_loss_entries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    entry_date timestamp without time zone NOT NULL,
    entry_type character varying NOT NULL,
    category character varying NOT NULL,
    sub_category character varying,
    source_type character varying NOT NULL,
    source_id character varying NOT NULL,
    description text NOT NULL,
    amount numeric(15,2) NOT NULL,
    quantity integer DEFAULT 1,
    unit_amount numeric(10,2),
    store_id character varying,
    customer_id character varying,
    product_id character varying,
    staff_id character varying,
    fiscal_year integer NOT NULL,
    fiscal_period integer NOT NULL,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.profit_loss_entries OWNER TO neondb_owner;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_permissions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    role_name character varying NOT NULL,
    module character varying NOT NULL,
    permissions jsonb NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.role_permissions OWNER TO neondb_owner;

--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sale_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sale_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL
);


ALTER TABLE public.sale_items OWNER TO neondb_owner;

--
-- Name: sales; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sales (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    store_id character varying NOT NULL,
    customer_id character varying,
    staff_id character varying NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    payment_method character varying NOT NULL,
    payment_status character varying DEFAULT 'completed'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.sales OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    staff_code character varying(20) NOT NULL,
    employee_id character varying(50),
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255),
    phone character varying(20),
    address text,
    "position" character varying(100) NOT NULL,
    department character varying(100),
    store_id character varying,
    manager_id uuid,
    hire_date date NOT NULL,
    termination_date date,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    role character varying(50) DEFAULT 'staff'::character varying NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb,
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(20),
    emergency_contact_relation character varying(100),
    avatar character varying(500),
    date_of_birth date,
    gender character varying(10),
    nationality character varying(100),
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    username character varying(50),
    password character varying(255),
    minimum_working_hours numeric(4,2) DEFAULT 8.00,
    daily_working_hours numeric(4,2) DEFAULT 8.00,
    blood_group character varying(5),
    staff_photo character varying(500),
    documents jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.staff OWNER TO neondb_owner;

--
-- Name: staff_profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff_profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    staff_code character varying NOT NULL,
    job_title character varying NOT NULL,
    department character varying NOT NULL,
    specialization character varying,
    license_number character varying,
    permissions jsonb DEFAULT '[]'::jsonb,
    work_schedule jsonb,
    salary numeric(12,2),
    hire_date date NOT NULL,
    status character varying DEFAULT 'active'::character varying,
    supervisor_id character varying,
    emergency_contact jsonb,
    qualifications jsonb DEFAULT '[]'::jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.staff_profiles OWNER TO neondb_owner;

--
-- Name: store_inventory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.store_inventory (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    store_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer DEFAULT 0,
    last_restocked timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now(),
    reserved_quantity integer DEFAULT 0,
    min_stock integer DEFAULT 0,
    max_stock integer DEFAULT 100,
    location character varying(255)
);


ALTER TABLE public.store_inventory OWNER TO neondb_owner;

--
-- Name: stores; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stores (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    address text NOT NULL,
    city character varying NOT NULL,
    state character varying NOT NULL,
    zip_code character varying NOT NULL,
    phone character varying,
    email character varying,
    manager_id character varying,
    is_active boolean DEFAULT true,
    timezone character varying DEFAULT 'America/New_York'::character varying,
    opening_hours text,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.stores OWNER TO neondb_owner;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.suppliers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    contact_person character varying,
    email character varying,
    phone character varying,
    address text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.suppliers OWNER TO neondb_owner;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category character varying NOT NULL,
    key character varying NOT NULL,
    value text,
    is_encrypted boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_settings OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'staff'::character varying,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    username character varying,
    password_hash character varying
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: account_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.account_categories (id, name, code, description, is_active, created_at) FROM stdin;
f07890a2-0b51-4ad4-a0c2-8ae523bb890c	Assets	A	All assets including cash, inventory, equipment	t	2025-08-06 02:34:58.146145
6a9efc48-75de-49ea-b810-67f0fad376be	Liabilities	L	All liabilities including accounts payable, loans	t	2025-08-06 02:34:58.146145
4f766dfd-4e41-4506-9f07-2d6096cca1ec	Equity	E	Owner equity, retained earnings	t	2025-08-06 02:34:58.146145
ee006d06-54a2-4af4-b247-12a8a0dfae16	Revenue	R	Income from sales, services, appointments	t	2025-08-06 02:34:58.146145
33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	Expenses	X	All business expenses including payroll, supplies, utilities	t	2025-08-06 02:34:58.146145
\.


--
-- Data for Name: appointment_actions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointment_actions (id, appointment_id, doctor_id, action_type, notes, action_date) FROM stdin;
\.


--
-- Data for Name: appointment_prescriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointment_prescriptions (id, appointment_id, patient_id, doctor_id, prescription_code, medications, diagnosis, symptoms, treatment_plan, follow_up_date, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.appointments (id, patient_id, customer_id, store_id, staff_id, assigned_doctor_id, appointment_date, duration, service, appointment_fee, payment_status, payment_method, payment_date, status, priority, notes, doctor_notes, created_at, updated_at) FROM stdin;
e6f34a90-ade2-4774-9e30-cf656cbc6b1d	f50689ad-023b-4c75-b85c-07f4aa0f75b8	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-03 14:00:00	60	Comprehensive Eye Examination	150.00	pending	\N	\N	scheduled	normal	Test appointment with doctor assignment	\N	2025-08-02 14:12:27.763182	2025-08-02 14:12:27.763182
a38cb7fd-2c0b-441f-be5b-37b01667f8cc	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-04 15:30:00	45	Contact Lens Fitting	75.00	paid	card	\N	confirmed	normal	Follow-up appointment for contact lens fitting	\N	2025-08-02 14:15:39.3712	2025-08-02 14:15:39.3712
16c1f3c3-7151-4407-a46f-7085956c612e	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-21 06:56:00	60	eye-exam	150.00	pending	\N	\N	scheduled	normal	testing by pending payment 	\N	2025-08-02 15:53:21.92974	2025-08-02 15:53:21.92974
cf1cbcb2-d519-4ebf-8714-5e70cb23a4b2	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-19 06:58:00	60	glasses-fitting	110.02	paid	cash	2025-08-02 15:54:11.4	scheduled	normal	Payment paid testing 	\N	2025-08-02 15:54:13.924536	2025-08-02 15:54:13.924536
9bd40bcb-7dab-4b6d-b730-48cfe693990e	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-02 15:03:00	60	eye-exam	151.02	pending	\N	\N	scheduled	normal	Pending invoice 	\N	2025-08-02 15:59:33.092204	2025-08-02 15:59:33.092204
60af92ee-2ca7-4bed-832c-dd80b1640956	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-20 20:04:00	60	follow-up	79.05	paid	cash	2025-08-02 16:01:01.833	scheduled	normal	Paid appointment 	\N	2025-08-02 16:01:07.199446	2025-08-02 16:01:07.199446
1a0a113c-8498-476d-a564-853d66c63548	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-28 19:10:00	60	eye-exam	161.06	pending	\N	\N	scheduled	normal	Pending Appointment	\N	2025-08-02 16:07:32.94115	2025-08-02 16:07:32.94115
b1a69707-b651-4d5d-a4bc-0826be4dd5b9	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-11 19:11:00	60	follow-up	77.22	paid	cash	2025-08-02 16:08:56.346	scheduled	normal	Paid cash testing by 77.22	\N	2025-08-02 16:08:58.879578	2025-08-02 16:08:58.879578
5c7e5475-dc6f-4f7e-ba0c-ee5590b48eff	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-06 19:15:00	60	contact-lens	121.67	paid	cash	2025-08-02 16:12:34.929	scheduled	normal	121.67	\N	2025-08-02 16:12:37.452525	2025-08-02 16:12:37.452525
06a795f3-97ed-429b-b9f8-cc21c69aeeb4	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-19 19:14:00	60	consultation	222.06	paid	cash	2025-08-02 16:15:06.919	scheduled	normal	222.06	\N	2025-08-02 16:15:09.429199	2025-08-02 16:15:09.429199
a445f628-10f3-4002-8288-bcd9fd86ff66	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-13 18:20:00	60	contact-lens	141.33	paid	cash	2025-08-02 16:18:28.817	scheduled	normal	141.33	\N	2025-08-02 16:18:31.326262	2025-08-02 16:18:31.326262
ab38ffcc-3d57-414f-9f30-55334d1b0c3c	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025-08-21 19:26:00	60	consultation	227.65	paid	cash	2025-08-02 16:21:14.509	scheduled	normal	227.65	\N	2025-08-02 16:21:17.017828	2025-08-02 16:21:17.017828
1816f176-266c-404e-9b97-68b6b798633a	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	2025-08-06 19:27:00	60	follow-up	99.12	paid	cash	2025-08-02 16:24:51.485	scheduled	normal	99.12	\N	2025-08-02 16:24:53.983001	2025-08-02 16:24:53.983001
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.attendance (id, staff_id, store_id, date, check_in_time, check_out_time, total_hours, check_in_method, check_out_method, check_in_location, check_out_location, status, is_late, late_minutes, notes, qr_code, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, description, created_at) FROM stdin;
05b7e55f-ce54-4cdf-bc4f-bbf30062f531	Test Category 	Testing	2025-07-30 23:26:53.589095
\.


--
-- Data for Name: chart_of_accounts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chart_of_accounts (id, account_number, account_name, category_id, parent_account_id, account_type, sub_type, normal_balance, is_active, description, created_at, updated_at) FROM stdin;
a514a18d-4cb3-4056-ae36-2742f90ddfeb	1000	Cash and Cash Equivalents	f07890a2-0b51-4ad4-a0c2-8ae523bb890c	\N	asset	current_asset	debit	t	Cash on hand and bank deposits	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
a6f7e6ec-694f-4b4c-b5f4-0c77db2e38b7	1100	Accounts Receivable	f07890a2-0b51-4ad4-a0c2-8ae523bb890c	\N	asset	current_asset	debit	t	Customer outstanding balances	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
1b703f1c-16dc-4af8-8313-c78047f7022e	1200	Inventory	f07890a2-0b51-4ad4-a0c2-8ae523bb890c	\N	asset	current_asset	debit	t	Frames, lenses, and accessories inventory	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
9bdb93cc-e6d7-4a1c-bafb-cadf49e01488	1300	Prepaid Expenses	f07890a2-0b51-4ad4-a0c2-8ae523bb890c	\N	asset	current_asset	debit	t	Prepaid rent, insurance, and other expenses	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
f518d4b6-0ac7-4516-9706-eb41824ab6b4	1500	Equipment	f07890a2-0b51-4ad4-a0c2-8ae523bb890c	\N	asset	fixed_asset	debit	t	Medical equipment and fixtures	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
2ca8fb08-4deb-4b48-84f8-5e842242396f	1600	Accumulated Depreciation - Equipment	f07890a2-0b51-4ad4-a0c2-8ae523bb890c	\N	asset	fixed_asset	credit	t	Contra asset account for equipment depreciation	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
eb0d48d7-3c1f-462f-91d1-e65793db27ad	2000	Accounts Payable	6a9efc48-75de-49ea-b810-67f0fad376be	\N	liability	current_liability	credit	t	Supplier and vendor outstanding balances	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
c2097ca1-378a-45ab-8e7a-ba13d84798fb	2100	Accrued Wages Payable	6a9efc48-75de-49ea-b810-67f0fad376be	\N	liability	current_liability	credit	t	Unpaid staff wages and benefits	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
08f04492-21d3-4b4f-a5cc-1405912e0d83	2200	Payroll Tax Payable	6a9efc48-75de-49ea-b810-67f0fad376be	\N	liability	current_liability	credit	t	Employee and employer tax obligations	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
d8c74abf-7592-436c-ac29-c2adfffa21fa	2300	Sales Tax Payable	6a9efc48-75de-49ea-b810-67f0fad376be	\N	liability	current_liability	credit	t	Sales tax collected from customers	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
626e385b-66a6-45f4-a436-638cdedb3148	3000	Owner Equity	4f766dfd-4e41-4506-9f07-2d6096cca1ec	\N	equity	owner_equity	credit	t	Owner investment in the business	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
8baba2ef-616f-4d07-b6e4-18e78fc4e998	3100	Retained Earnings	4f766dfd-4e41-4506-9f07-2d6096cca1ec	\N	equity	retained_earnings	credit	t	Accumulated business profits	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
28b5dbca-9d80-47b3-9b35-145b91175ef7	4000	Product Sales Revenue	ee006d06-54a2-4af4-b247-12a8a0dfae16	\N	revenue	sales_revenue	credit	t	Revenue from frames, lenses, accessories	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
182b1dfe-2b8b-4ef4-ac88-1fb8f7bb395e	4100	Medical Services Revenue	ee006d06-54a2-4af4-b247-12a8a0dfae16	\N	revenue	service_revenue	credit	t	Revenue from eye exams, consultations	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
2aa48acc-4b90-444f-bab6-5ed3a524eebc	4200	Appointment Fees	ee006d06-54a2-4af4-b247-12a8a0dfae16	\N	revenue	service_revenue	credit	t	Fees collected for appointments and procedures	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
43689448-d867-47f7-9190-ad702805ba87	5000	Cost of Goods Sold	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	cogs	debit	t	Direct cost of inventory sold	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
248c5e91-a754-4bcb-bf8d-3fbea886f5be	6000	Payroll Expenses	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	operating_expense	debit	t	Staff salaries, wages, and benefits	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
c2789ead-794e-471c-bcd9-702e4b14c7e8	6100	Rent Expense	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	operating_expense	debit	t	Office and clinic space rental	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
a367500f-a35c-45da-8396-9d7692d23cd9	6200	Utilities Expense	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	operating_expense	debit	t	Electricity, water, internet, phone	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
4b961af4-4254-4476-942d-b67e72362846	6300	Insurance Expense	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	operating_expense	debit	t	Professional liability, property insurance	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
dc0deec9-97ab-4a86-a2e5-2d39431514d3	6400	Medical Supplies Expense	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	operating_expense	debit	t	Disposable supplies and medical consumables	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
aae16076-72b6-4f8a-82ca-5f24ca0e41cf	6500	Marketing & Advertising	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	operating_expense	debit	t	Promotional activities and advertising	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
f7a349a3-ed0d-4555-ac50-86847d963ee4	6600	Professional Services	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	operating_expense	debit	t	Legal, accounting, consulting fees	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
3dd98f7d-ce56-4cd5-9714-8bcc046428f3	6700	Equipment Maintenance	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	operating_expense	debit	t	Maintenance and repair of medical equipment	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
a18d01a6-e35e-47da-bd58-19b95d93cc87	6800	Depreciation Expense	33cb8bf8-e5d1-43c6-a013-ac3c399f87f9	\N	expense	operating_expense	debit	t	Depreciation of fixed assets	2025-08-06 02:35:24.592487	2025-08-06 02:35:24.592487
\.


--
-- Data for Name: communication_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.communication_log (id, customer_id, type, recipient, subject, message, status, sent_at) FROM stdin;
\.


--
-- Data for Name: custom_fields_config; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.custom_fields_config (id, entity_type, field_name, field_type, field_options, is_required, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, first_name, last_name, email, phone, date_of_birth, address, city, state, zip_code, loyalty_points, loyalty_tier, notes, custom_fields, created_at, updated_at) FROM stdin;
824a992b-5b2e-434a-a376-41801fc3b8ae	Test Customer	Customer1	Customer@Customer.com	41241	1979-05-07	klkl	saf	faf	faf	0	Bronze	\N	\N	2025-07-31 01:12:21.727634	2025-07-31 02:53:53.885
77bdac32-5eb1-45cb-869e-f7b8b8df93b8	test Patient1	fafa	\N	215	\N	515	515	515	51	0	Bronze	5151	{}	2025-07-31 03:22:30.478457	2025-07-31 03:22:30.478457
f8e50809-954c-4ff6-b1c2-a014218b1b36	Test Patient	2	qrwrqrq@gaga.com	42141	\N	tqfwf	rqrq	rqrq	rqr	0	Bronze	rqrq	{}	2025-07-31 13:18:50.26681	2025-07-31 13:18:50.26681
66fee2b2-4483-4979-bcf8-87d899580033	Test	Patient32	faffqrfq@fafaf.com	141	\N	fqwf	ff	af	wq	0	Bronze	fafa	{}	2025-07-31 14:11:56.389327	2025-07-31 14:11:56.389327
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.doctors (id, user_id, doctor_code, first_name, last_name, specialization, license_number, phone, email, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_templates (id, name, subject, body, template_type, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: general_ledger_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.general_ledger_entries (id, transaction_id, account_id, transaction_date, posting_date, description, reference_type, reference_id, debit_amount, credit_amount, running_balance, fiscal_year, fiscal_period, is_reversed, reversal_transaction_id, created_by, created_at) FROM stdin;
3a869c4c-31c9-4e81-9cd1-976b9fb2739a	GL-2025-001	a514a18d-4cb3-4056-ae36-2742f90ddfeb	2025-01-15 00:00:00	2025-08-06 02:38:07.480977	Cash received for Eye Examination	payment	TXN-2025-001	250.00	0.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
9ec6c611-88de-4d73-ae4e-55115ab847f5	GL-2025-001	182b1dfe-2b8b-4ef4-ac88-1fb8f7bb395e	2025-01-15 00:00:00	2025-08-06 02:38:07.480977	Revenue from Eye Examination	appointment	APT-001	0.00	250.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
d51c29a1-929b-44a2-afff-9ad8f66f37e2	GL-2025-002	a514a18d-4cb3-4056-ae36-2742f90ddfeb	2025-01-16 00:00:00	2025-08-06 02:38:07.480977	Cash received for Frames & Lenses	payment	TXN-2025-002	800.00	0.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
a2a85949-504c-4e94-9b94-d38decb13c6f	GL-2025-002	28b5dbca-9d80-47b3-9b35-145b91175ef7	2025-01-16 00:00:00	2025-08-06 02:38:07.480977	Revenue from Product Sales	sale	INV-789319	0.00	800.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
a6a8992b-8080-46d4-8566-ac3c93cce786	GL-2025-003	43689448-d867-47f7-9190-ad702805ba87	2025-01-16 00:00:00	2025-08-06 02:38:07.480977	Cost of Goods Sold - Frames & Lenses	sale	INV-789319	320.00	0.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
1538ad95-b60b-4fff-878c-07a3c6317ea3	GL-2025-003	1b703f1c-16dc-4af8-8313-c78047f7022e	2025-01-16 00:00:00	2025-08-06 02:38:07.480977	Reduction in Inventory	sale	INV-789319	0.00	320.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
3b65a267-c2c2-4f5b-ac23-6a31ca39d781	GL-2025-004	a514a18d-4cb3-4056-ae36-2742f90ddfeb	2025-01-17 00:00:00	2025-08-06 02:38:07.480977	Cash received for Contact Lens Fitting	payment	TXN-2025-003	150.00	0.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
5aa877e9-eaaf-4670-adae-454cd457fe92	GL-2025-004	182b1dfe-2b8b-4ef4-ac88-1fb8f7bb395e	2025-01-17 00:00:00	2025-08-06 02:38:07.480977	Revenue from Contact Lens Fitting	appointment	APT-002	0.00	150.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
89feccc1-42a5-441d-8588-26c4759237b9	GL-2025-005	c2789ead-794e-471c-bcd9-702e4b14c7e8	2025-01-01 00:00:00	2025-08-06 02:38:07.480977	January Rent Expense	expense	RENT-JAN-2025	8500.00	0.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
f806380b-7482-4c28-999f-cbcce547fc0e	GL-2025-005	a514a18d-4cb3-4056-ae36-2742f90ddfeb	2025-01-01 00:00:00	2025-08-06 02:38:07.480977	Cash paid for Rent	payment	TXN-2025-E001	0.00	8500.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
1351e356-691f-4bb1-a106-cf2f03e199c8	GL-2025-006	248c5e91-a754-4bcb-bf8d-3fbea886f5be	2025-01-31 00:00:00	2025-08-06 02:38:07.480977	January Payroll Expense	payroll	PAY-2025-001	96850.00	0.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
c3df1547-a8b8-49dd-8c10-817dd3a14740	GL-2025-006	a514a18d-4cb3-4056-ae36-2742f90ddfeb	2025-01-31 00:00:00	2025-08-06 02:38:07.480977	Cash paid for Payroll	payment	TXN-2025-E003	0.00	68897.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
5d8ab6ba-036c-42af-a385-80a8603e223a	GL-2025-006	c2097ca1-378a-45ab-8e7a-ba13d84798fb	2025-01-31 00:00:00	2025-08-06 02:38:07.480977	Accrued Payroll Taxes & Deductions	payroll	PAY-2025-001	0.00	27953.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
6dfbe535-9895-4f24-81b2-a66a4231ecb1	GL-2025-007	a367500f-a35c-45da-8396-9d7692d23cd9	2025-01-15 00:00:00	2025-08-06 02:38:07.480977	January Utilities Expense	expense	UTIL-JAN-2025	1850.00	0.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
e26dd3ae-704c-4f86-a1e4-b3c71f2b67c2	GL-2025-007	a514a18d-4cb3-4056-ae36-2742f90ddfeb	2025-01-15 00:00:00	2025-08-06 02:38:07.480977	Cash paid for Utilities	payment	TXN-2025-E002	0.00	1850.00	0.00	2025	1	f	\N	45761289	2025-08-06 02:38:07.480977
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoice_items (id, invoice_id, product_id, product_name, description, quantity, unit_price, discount, total, created_at) FROM stdin;
69a1508f-bed0-43ac-9180-654f197c2f59	95df7b20-7728-4e24-acb0-96758ccc5e0a	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	1	1999.00	5.00	1899.05	2025-08-03 01:34:16.999033
853bbef3-18f9-40ed-8a6f-a1339aaddf42	d79b37e9-63b4-4ae8-a4a0-fd18f31f0156	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	5.00	2849.05	2025-08-03 01:35:31.537514
2bb606fd-01fc-4104-921a-08e8ec296eec	dccead35-380c-4925-910d-5149dc33faf1	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	1	1999.00	0.00	1999.00	2025-08-03 04:35:42.429984
5ca25350-65ff-4536-a689-e4c83caa3c2c	9caf308d-cd7e-47f5-bbab-5ae640138602	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	6.00	2819.06	2025-08-03 04:36:31.627439
661020dd-1359-44bf-b9d3-905fa89f4f1c	976399a7-22cd-47c3-8dc5-a35139bde7b8	\N	Test Custom Product 3	\N	1	75.00	0.00	75.00	2025-08-03 04:49:39.566622
333976cb-40e9-4d82-a3c1-fcc2fd6babb7	b7a22ace-f982-4d9d-b4cd-e5cc37621d6b	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	2	1999.00	10.00	3598.20	2025-08-03 04:52:11.521035
e4a198e9-eb4f-4083-9c83-bf73ee3f9da6	b7a22ace-f982-4d9d-b4cd-e5cc37621d6b	\N	Custom Product A	\N	1	699.00	5.00	664.05	2025-08-03 04:52:11.521035
48487534-26d4-4a3d-8cd8-73dc9d42a1ef	5a76129f-2967-4d78-b42b-3d813b9eb262	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	1	1999.00	10.00	1799.10	2025-08-03 04:55:56.241816
812bd888-2da1-4cc7-af6f-b5e170c7b1d3	5a76129f-2967-4d78-b42b-3d813b9eb262	\N	Custom Product X	\N	1	780.00	4.00	748.80	2025-08-03 04:55:56.241816
cc137fed-6e93-4a4c-b10b-798e775eeeeb	40778a29-f26b-4231-96b3-ccbc3301a437	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	3	1999.00	4.00	5757.12	2025-08-03 05:01:42.604799
ef1b4f68-b957-4dfe-aa36-1c2a3e2352bb	40778a29-f26b-4231-96b3-ccbc3301a437	\N	Custom Product PX	\N	1	655.00	5.00	622.25	2025-08-03 05:01:42.604799
10593caa-bff8-47f4-aefa-821c4f2b3ed7	8838d526-1f21-406f-8d81-98f31156f2ef	\N	Custom Product Q1	\N	1	453.00	2.00	443.94	2025-08-03 05:07:55.417246
3bc0298b-8663-49b3-9ea5-6b4b7614d07e	8838d526-1f21-406f-8d81-98f31156f2ef	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	7.00	2789.07	2025-08-03 05:07:55.417246
4f0ff9df-17ce-44cb-9688-ffad0fbacfd4	76cadefe-2563-441c-a9b5-167e20049538	\N	Custom Product A14	\N	1	399.00	4.00	383.04	2025-08-03 05:18:46.310197
6978e833-12af-4bd5-bf7c-c7aafaf469ec	76cadefe-2563-441c-a9b5-167e20049538	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	5.00	2849.05	2025-08-03 05:18:46.310197
6ce5b92f-109c-4d57-8a4a-9c2cb7187322	42c5fc3d-75b7-4948-a6e8-7626f96281f6	\N	Custom Product  N52	\N	1	2299.00	5.00	2184.05	2025-08-03 05:27:18.8575
7aefc34c-b780-44ca-9baf-5f8939ce9efa	42c5fc3d-75b7-4948-a6e8-7626f96281f6	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	12.00	2639.12	2025-08-03 05:27:18.8575
857b7fda-46c4-4efb-b95c-63ec24365b80	115ca77e-c41b-48fa-8048-ae84e6accad2	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	1	1999.00	5.00	1899.05	2025-08-03 05:31:11.423748
d70ee017-1111-4667-a28d-4595c02e4c34	115ca77e-c41b-48fa-8048-ae84e6accad2	\N	C231	\N	1	1288.00	6.00	1210.72	2025-08-03 05:31:11.423748
5931955f-95ac-4e2a-bc14-f0c2cd023167	01511361-1dc8-4c04-9e6b-9d5b9677b0fb	\N	NCA14	\N	1	1253.00	1.00	1240.47	2025-08-03 05:40:47.193805
fe0494ac-2ef6-485b-bc71-83493de8ea4b	01511361-1dc8-4c04-9e6b-9d5b9677b0fb	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	2	2999.00	0.00	5998.00	2025-08-03 05:40:47.193805
978aeb46-47d7-4d8d-a2ca-4bcb490d8834	a57fe68c-2a39-41b3-a82b-03203215a4ae	\N	FW22	\N	1	1221.00	2.00	1196.58	2025-08-03 06:07:48.094225
2c4f497c-124d-4e0f-ad83-169d2dc029fb	a57fe68c-2a39-41b3-a82b-03203215a4ae	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	\N	2	1999.00	5.00	3798.10	2025-08-03 06:07:48.094225
350e601d-1c9e-4d9a-bff5-8fbbd8a625af	b4f6d586-f95f-4f48-beb4-eb406fe706dd	\N	Test Product	\N	1	100.00	0.00	100.00	2025-08-03 06:14:42.791192
d67b7fae-4005-446e-bd12-5e0ce0979030	24417ce4-eaee-4169-8cea-65486f81e345	\N	Fixed Test Product	\N	1	100.00	0.00	100.00	2025-08-03 06:15:10.008672
a59f8339-1180-4f2c-bc5f-a7e167a892f8	f26fbe36-eb6d-40e7-b254-05dada934680	\N	Final Test Product	\N	1	100.00	0.00	100.00	2025-08-03 06:15:50.921145
5aeb4ece-459b-481d-913f-26fdea170815	4ea17efc-ab96-4ada-ac57-db6fc5c678b2	\N	P525A	\N	1	1987.00	1.00	1967.13	2025-08-03 06:20:37.960152
dc525fda-b000-4871-b047-4ce5d115d373	4ea17efc-ab96-4ada-ac57-db6fc5c678b2	00d6d248-ae81-4560-93d7-50625ac8e478	Test	\N	1	2999.00	4.00	2879.04	2025-08-03 06:20:37.960152
e2c81fce-3600-4dc5-80c2-9e37978e1323	163b7b8c-909e-498e-9de0-6091e2049257	09dea246-3141-4f3d-9e3e-a010c9ab0f71	Test Frame Model-X1	Restock - 25 units	25	120.00	0.00	3000.00	2025-08-05 01:43:00.019826
faa2d847-14c3-4ee5-9e04-a543f46db3e2	c5e586f8-721c-4930-80df-52e356f72335	c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	Purchase order - 2 units from Test Supplier	2	1850.00	0.00	3700.00	2025-08-05 02:53:34.935928
a3fbc248-5b7e-4da3-ba67-0c96e1550450	16aced93-60d3-4187-9840-af241e414706	c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	Purchase order - 2 units from Test Supplier	2	1851.00	0.00	3702.00	2025-08-05 03:01:09.841718
de0169d1-92d8-48de-8add-bb066f00e3e0	f1a62c2d-8cd3-4e8f-88da-d41d9cb4e641	c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	Purchase order - 2 units from Test Supplier	2	45.00	0.00	90.00	2025-08-05 03:08:04.861949
6fef988e-8e90-4023-9ae2-5e2e4252bc2d	a413256c-0602-4da1-851e-6e623b9ce3fd	c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	Purchase order - 1 units from Test Supplier	1	50.00	0.00	50.00	2025-08-05 03:09:18.686951
eef5bddc-d6a6-4e74-a07d-a69f813b7975	e16f5f29-574e-4b6f-af02-390aa85d6ab4	c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	Purchase order - 5 units from Test Supplier	5	1800.00	0.00	9000.00	2025-08-05 03:12:48.244156
ffac0cf5-c332-46a1-890a-abd25c77e040	0bab05b7-9aa4-4a49-8d07-c21c558fa682	6ab10edd-c2a4-4d47-a630-c3f17f7d0d49	Ray-ban sunglasses A2	Bulk restock - 1 units	1	800.00	0.00	800.00	2025-08-05 03:16:35.405327
8e24ff5c-c6e1-45d2-8d62-3382d18cabde	0bab05b7-9aa4-4a49-8d07-c21c558fa682	0eed9a96-7226-4a02-adb0-b58c1870fdfb	RayBan-3422	Bulk restock - 2 units	2	190.00	0.00	380.00	2025-08-05 03:16:35.405327
76955e93-e2aa-4fbb-9145-82fc4a932895	0bab05b7-9aa4-4a49-8d07-c21c558fa682	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	Bulk restock - 4 units	4	1500.00	0.00	6000.00	2025-08-05 03:16:35.405327
178404d7-95ec-4437-b710-01cf8f2bb3af	27cbda65-ed32-4ca7-9ef0-a8f2c38676a5	6ab10edd-c2a4-4d47-a630-c3f17f7d0d49	Ray-ban sunglasses A2	Bulk restock - 1 units	1	800.00	0.00	800.00	2025-08-05 03:16:36.095187
347c1de4-b883-4fa8-946c-41bd7c74c937	27cbda65-ed32-4ca7-9ef0-a8f2c38676a5	0eed9a96-7226-4a02-adb0-b58c1870fdfb	RayBan-3422	Bulk restock - 2 units	2	190.00	0.00	380.00	2025-08-05 03:16:36.095187
47bb7580-fb3b-4b1f-af14-9ea203565fcf	27cbda65-ed32-4ca7-9ef0-a8f2c38676a5	8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	Bulk restock - 4 units	4	1500.00	0.00	6000.00	2025-08-05 03:16:36.095187
b0f22b07-2a94-46d6-a25a-7d3de8c7c4cd	60706ea3-956f-4ee7-ad9f-f5b4556bd8dc	c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	Bulk restock - 2 units	2	1801.00	0.00	3602.00	2025-08-05 03:18:32.331397
440b5106-e752-47b0-bc49-8bf09326205e	60706ea3-956f-4ee7-ad9f-f5b4556bd8dc	b47a5663-7917-4076-b9d3-76f678ad5988	Ray-Ban9832	Bulk restock - 1 units	1	800.00	0.00	800.00	2025-08-05 03:18:32.331397
75078c60-bf3d-4827-ac04-8e4081f400a6	60706ea3-956f-4ee7-ad9f-f5b4556bd8dc	0eed9a96-7226-4a02-adb0-b58c1870fdfb	RayBan-3422	Bulk restock - 5 units	5	190.00	0.00	950.00	2025-08-05 03:18:32.331397
c89a51e9-8353-446a-8c15-47edc350245b	c850014a-de46-4d59-9187-5c1c369c0baf	6bade2fd-2c5a-49ef-bd8e-26702e44704b	ABC Crane	Purchase order - 8 units from Unknown Supplier	8	175.00	0.00	1400.00	2025-08-05 04:10:02.546698
85be5baa-d549-4a9d-9ee7-77e3503f47ad	32834b05-a2b1-4f15-a404-6c106573172d	c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	Purchase order - 5 units from Unknown Supplier	5	300.00	0.00	1500.00	2025-08-05 04:11:03.811066
d9a4beb7-83e0-4f04-9df4-c49a44b8a191	26c617d7-a2cc-4446-8fd1-b8c512e4724b	b47a5663-7917-4076-b9d3-76f678ad5988	Ray-Ban9832	Purchase order - 3 units from Test Supplier	3	250.00	0.00	750.00	2025-08-05 04:12:49.428618
eaf0f846-e433-47b2-beeb-aa21fd20c508	6f7c761d-8b5b-4c8a-a400-785dd6b2eb4b	c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	Purchase order - 5 units from Test Supplier	5	300.00	0.00	1500.00	2025-08-05 04:18:49.307021
d59a4cbd-20a2-4798-b907-983164c3b056	0721581e-b68e-451b-ac54-636d4f3142d8	b47a5663-7917-4076-b9d3-76f678ad5988	Ray-Ban9832	\N	1	899.00	2.00	881.02	2025-08-05 04:46:24.554328
e19ea3ab-70f4-4510-b7ce-8818f266af21	0721581e-b68e-451b-ac54-636d4f3142d8	6bade2fd-2c5a-49ef-bd8e-26702e44704b	ABC Crane	\N	1	999.00	4.00	959.04	2025-08-05 04:46:24.554328
0b698bcd-bcc4-44b5-ac1a-9c81f0a813b7	d4882d30-5997-42d3-8873-1c218a1e08d9	6bade2fd-2c5a-49ef-bd8e-26702e44704b	ABC Crane	\N	1	999.00	0.00	999.00	2025-08-05 04:56:29.656508
e747a95e-52f2-47d8-a2fd-ca6e5883a200	d4882d30-5997-42d3-8873-1c218a1e08d9	c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	\N	1	1877.00	0.00	1877.00	2025-08-05 04:56:29.656508
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, invoice_number, customer_id, store_id, date, due_date, subtotal, tax_rate, tax_amount, discount_amount, total, status, payment_method, payment_date, notes, custom_fields, created_at, updated_at, applied_coupon_code, coupon_discount_amount, service_type, coupon_discount, coupon_type, coupon_description, source) FROM stdin;
95df7b20-7728-4e24-acb0-96758ccc5e0a	INV-856493	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 01:34:16.768375	\N	1899.05	8.50	161.42	0.00	2060.47	draft	\N	\N	\N	\N	2025-08-03 01:34:16.768375	2025-08-03 01:34:16.768375	\N	0.00	\N	0.00	\N	\N	\N
dccead35-380c-4925-910d-5149dc33faf1	INV-741889	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:35:42.185412	\N	1999.00	8.50	169.92	0.00	2168.92	draft	cash	\N	\N	\N	2025-08-03 04:35:42.185412	2025-08-03 04:35:42.185412	\N	0.00	\N	0.00	\N	\N	\N
cb17eb16-4777-4df3-a580-780ec8bb06bc	INV-370588	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:46:13.697054	\N	2373.10	14.00	332.23	10.50	2694.83	draft	cash	\N	$2693.36 testing quick sale 	\N	2025-08-03 04:46:13.697054	2025-08-03 04:46:13.697054	\N	0.00	\N	0.00	\N	\N	\N
9caf308d-cd7e-47f5-bbab-5ae640138602	INV-791138	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:36:31.399126	\N	2819.06	14.00	394.67	50.00	3163.73	paid	cash	2025-08-03 04:48:05.44	\N	\N	2025-08-03 04:36:31.399126	2025-08-03 04:48:05.44	\N	0.00	\N	0.00	\N	\N	\N
8ea21e9c-0197-45e1-b4f8-9a76ed0ec1f3	INV-524962	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:48:45.234512	\N	100.00	8.00	8.00	0.00	108.00	draft	cash	\N	Test invoice with custom product	\N	2025-08-03 04:48:45.234512	2025-08-03 04:48:45.234512	\N	0.00	\N	0.00	\N	\N	\N
a45baea8-923e-47fb-a871-fa2292771dc0	INV-556381	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:49:16.751397	\N	50.00	8.00	4.00	0.00	54.00	draft	cash	\N	Test invoice with custom product 2	\N	2025-08-03 04:49:16.751397	2025-08-03 04:49:16.751397	\N	0.00	\N	0.00	\N	\N	\N
976399a7-22cd-47c3-8dc5-a35139bde7b8	INV-577392	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:49:39.28561	\N	75.00	8.00	6.00	0.00	81.00	draft	cash	\N	Test invoice with custom product 3	\N	2025-08-03 04:49:39.28561	2025-08-03 04:49:39.28561	\N	0.00	\N	0.00	\N	\N	\N
b7a22ace-f982-4d9d-b4cd-e5cc37621d6b	INV-731008	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:52:11.281635	\N	4262.25	14.00	596.72	9.00	4849.97	draft	cash	\N	$4848.70 testing qucick payment 	\N	2025-08-03 04:52:11.281635	2025-08-03 04:52:11.281635	\N	0.00	\N	0.00	\N	\N	\N
5a76129f-2967-4d78-b42b-3d813b9eb262	INV-955734	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 04:55:56.00143	\N	2547.90	12.00	305.75	5.00	2848.65	draft	cash	\N	$2848.05	\N	2025-08-03 04:55:56.00143	2025-08-03 04:55:56.00143	\N	0.00	\N	0.00	\N	\N	\N
40778a29-f26b-4231-96b3-ccbc3301a437	INV-302086	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:01:42.360122	\N	6379.37	18.00	1148.29	79.00	7448.66	draft	cash	\N	\N	\N	2025-08-03 05:01:42.360122	2025-08-03 05:01:42.360122	\N	0.00	\N	0.00	\N	\N	\N
8838d526-1f21-406f-8d81-98f31156f2ef	INV-674921	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:07:55.182656	\N	3233.01	18.00	581.94	12.00	3802.95	draft	cash	\N	\N	\N	2025-08-03 05:07:55.182656	2025-08-03 05:07:55.182656	\N	0.00	\N	0.00	\N	\N	\N
76cadefe-2563-441c-a9b5-167e20049538	INV-325806	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:18:46.068822	\N	3232.09	18.00	581.78	121.00	3692.87	draft	cash	\N	\N	\N	2025-08-03 05:18:46.068822	2025-08-03 05:18:46.068822	\N	0.00	\N	0.00	\N	\N	\N
42c5fc3d-75b7-4948-a6e8-7626f96281f6	INV-838323	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:27:18.617674	\N	4823.17	18.00	868.17	19.00	5672.34	draft	cash	\N	$5668.92 quick sale testing 	\N	2025-08-03 05:27:18.617674	2025-08-03 05:27:18.617674	\N	0.00	\N	0.00	\N	\N	\N
01511361-1dc8-4c04-9e6b-9d5b9677b0fb	INV-646703	f8e50809-954c-4ff6-b1c2-a014218b1b36	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:40:46.962707	\N	7238.47	18.00	1302.92	12.00	8529.39	paid	cash	2025-08-03 05:58:18.609524	\N	\N	2025-08-03 05:40:46.962707	2025-08-03 05:40:46.962707	\N	0.00	\N	0.00	\N	\N	\N
a57fe68c-2a39-41b3-a82b-03203215a4ae	INV-267557	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:07:47.847784	\N	4994.68	18.00	899.04	19.00	5874.72	draft	cash	\N	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|	\N	2025-08-03 06:07:47.847784	2025-08-03 06:07:47.847784	\N	0.00	\N	0.00	\N	\N	\N
4ea17efc-ab96-4ada-ac57-db6fc5c678b2	INV-037456	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:20:37.719464	\N	4846.17	18.00	872.31	10.00	5708.48	paid	cash	\N	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|$5706.68 test quick sale	\N	2025-08-03 06:20:37.719464	2025-08-03 06:20:37.719464	\N	0.00	\N	0.00	\N	\N	\N
7225cbd0-6d2d-4fb7-b4c6-7a8caa03ac8f	INV-158271	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-04 22:55:58.291381	\N	13500.00	8.50	1147.50	0.00	14647.50	paid	bank_transfer	\N	reorder product ABC Crane	\N	2025-08-04 22:55:58.291381	2025-08-04 22:55:58.291381	\N	0.00	\N	0.00	\N	\N	\N
a79fcd0e-ce8c-42dc-a818-501967661beb	INV-170621	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-04 22:56:10.640095	\N	18000.00	8.50	1530.00	0.00	19530.00	paid	bank_transfer	\N	Restock order for ABC Crane	\N	2025-08-04 22:56:10.640095	2025-08-04 22:56:10.640095	\N	0.00	\N	0.00	\N	\N	\N
fbcf7be8-8a43-41a3-a3e4-bba2ffa854db	INV-149673	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 01:25:49.693577	\N	755.00	8.50	64.18	0.00	819.18	paid	bank_transfer	\N	Test reorder for invoice preview	\N	2025-08-05 01:25:49.693577	2025-08-05 01:25:49.693577	\N	0.00	\N	0.00	\N	\N	\N
163b7b8c-909e-498e-9de0-6091e2049257	INV-179823	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 01:42:59.846173	\N	3000.00	8.50	255.00	0.00	3255.00	paid	bank_transfer	\N	Restock order for Test Frame Model-X1 - Premium optical frames	\N	2025-08-05 01:42:59.846173	2025-08-05 01:42:59.846173	\N	0.00	\N	0.00	\N	\N	\N
f1a62c2d-8cd3-4e8f-88da-d41d9cb4e641	INV-284541	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 03:08:04.707931	\N	90.00	8.50	7.65	0.00	90.00	paid	bank_transfer	\N	Test reorder for Ray-Ban	\N	2025-08-05 03:08:04.707931	2025-08-05 03:08:04.707931	\N	0.00	\N	0.00	\N	\N	reorder
a413256c-0602-4da1-851e-6e623b9ce3fd	INV-358369	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 03:09:18.535535	\N	50.00	8.50	4.25	0.00	50.00	paid	cash	\N	Second test reorder	\N	2025-08-05 03:09:18.535535	2025-08-05 03:09:18.535535	\N	0.00	\N	0.00	\N	\N	\N
c5e586f8-721c-4930-80df-52e356f72335	INV-414591	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 02:53:34.756094	\N	3700.00	14.00	518.00	10.00	4212.00	pending	bank_transfer	\N	Reorder Stock - Ray-Ban@23225	\N	2025-08-05 02:53:34.756094	2025-08-05 02:53:34.756094	\N	0.00	\N	0.00	\N	\N	reorder
e16f5f29-574e-4b6f-af02-390aa85d6ab4	INV-567912	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 03:12:48.089025	\N	9000.00	14.00	1260.00	1.00	10261.00	paid	cash	\N	Test payment 	\N	2025-08-05 03:12:48.089025	2025-08-05 03:12:48.089025	\N	0.00	\N	0.00	\N	\N	\N
0bab05b7-9aa4-4a49-8d07-c21c558fa682	INV-BULK-795229	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 03:16:35.246722	\N	7180.00	14.00	1003.80	10.00	8183.80	paid	bank_transfer	\N	testing bulk invoice	\N	2025-08-05 03:16:35.246722	2025-08-05 03:16:35.246722	\N	0.00	\N	0.00	\N	\N	\N
27cbda65-ed32-4ca7-9ef0-a8f2c38676a5	INV-BULK-795934	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 03:16:35.952381	\N	7180.00	14.00	1003.80	10.00	8183.80	paid	bank_transfer	\N	testing bulk invoice	\N	2025-08-05 03:16:35.952381	2025-08-05 03:16:35.952381	\N	0.00	\N	0.00	\N	\N	\N
60706ea3-956f-4ee7-ad9f-f5b4556bd8dc	INV-BULK-912170	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 03:18:32.1884	\N	5352.00	14.00	747.88	10.00	6099.88	paid	bank_transfer	\N	bulk 2	\N	2025-08-05 03:18:32.1884	2025-08-05 03:18:32.1884	\N	0.00	\N	0.00	\N	\N	\N
c850014a-de46-4d59-9187-5c1c369c0baf	INV-002378	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 04:10:02.398005	\N	1400.00	8.50	119.00	0.00	1400.00	paid	bank_transfer	\N	Stock replenishment for high-demand frames	\N	2025-08-05 04:10:02.398005	2025-08-05 04:10:02.398005	\N	0.00	\N	0.00	\N	\N	\N
32834b05-a2b1-4f15-a404-6c106573172d	INV-063641	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 04:11:03.661396	\N	1500.00	8.50	127.50	0.00	1500.00	paid	bank_transfer	\N	Emergency restocking for lens shortage	\N	2025-08-05 04:11:03.661396	2025-08-05 04:11:03.661396	\N	0.00	\N	0.00	\N	\N	\N
26c617d7-a2cc-4446-8fd1-b8c512e4724b	INV-169112	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 04:12:49.274774	\N	750.00	8.50	63.75	0.00	750.00	paid	bank_transfer	\N	Test reorder to verify expenditure system	\N	2025-08-05 04:12:49.274774	2025-08-05 04:12:49.274774	\N	0.00	\N	0.00	\N	\N	\N
6f7c761d-8b5b-4c8a-a400-785dd6b2eb4b	INV-528997	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 04:18:49.16027	\N	1500.00	8.50	127.50	0.00	1500.00	paid	bank_transfer	\N	Test persistent expenditure tracking system	\N	2025-08-05 04:18:49.16027	2025-08-05 04:18:49.16027	\N	0.00	\N	0.00	\N	\N	\N
0721581e-b68e-451b-ac54-636d4f3142d8	INV-184233	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 04:46:24.397387	\N	1840.06	14.00	257.61	1.00	2096.67	paid	cash	\N	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|Quick sale invoice demo	\N	2025-08-05 04:46:24.397387	2025-08-05 04:46:24.397387	\N	0.00	\N	0.00	\N	\N	\N
115ca77e-c41b-48fa-8048-ae84e6accad2	INV-070929	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 05:31:11.188042	\N	3109.77	5.00	155.49	129.00	3136.26	paid	cash	2025-08-05 20:20:05.331	$3129.81	\N	2025-08-03 05:31:11.188042	2025-08-05 20:20:05.331	\N	0.00	\N	0.00	\N	\N	\N
16aced93-60d3-4187-9840-af241e414706	INV-869510	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 03:01:09.684359	\N	3702.00	8.50	314.67	2.00	4020.67	paid	cash	2025-08-05 20:24:47.653	Purchase order for Ray-Ban@23225 from Test Supplier	\N	2025-08-05 03:01:09.684359	2025-08-05 20:24:47.654	\N	0.00	\N	0.00	\N	\N	reorder
d79b37e9-63b4-4ae8-a4a0-fd18f31f0156	INV-931041	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 01:35:31.304119	\N	2849.05	14.00	398.87	12.00	3235.92	paid	cash	2025-08-05 20:26:05.4	\N	\N	2025-08-03 01:35:31.304119	2025-08-05 20:26:05.401	\N	0.00	\N	0.00	\N	\N	\N
24417ce4-eaee-4169-8cea-65486f81e345	INV-709529	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:15:09.78489	\N	100.00	8.50	8.50	0.00	108.50	paid	cash	2025-08-05 20:29:39.53	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|Fixed test for Patient XYZ	\N	2025-08-03 06:15:09.78489	2025-08-05 20:29:39.531	\N	0.00	\N	0.00	\N	\N	\N
b4f6d586-f95f-4f48-beb4-eb406fe706dd	INV-682279	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:14:42.547274	\N	100.00	8.50	8.50	0.00	108.50	paid	cash	2025-08-05 20:34:07.204	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|Test invoice for Patient XYZ	\N	2025-08-03 06:14:42.547274	2025-08-05 20:34:07.205	\N	0.00	\N	0.00	\N	\N	\N
d4882d30-5997-42d3-8873-1c218a1e08d9	INV-789319	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-05 04:56:29.498018	\N	2876.00	14.00	402.64	4.00	3274.64	paid	cash	\N	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|$3274.08	\N	2025-08-05 04:56:29.498018	2025-08-05 04:56:29.498018	\N	0.00	\N	0.00	\N	\N	\N
f26fbe36-eb6d-40e7-b254-05dada934680	INV-750435	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-03 06:15:50.695004	\N	100.00	8.50	8.50	0.00	108.50	paid	cash	2025-08-05 20:17:59.841	PATIENT_ID:b5ca95fd-579b-4300-95e4-e6f5ec293805|Final test for Patient XYZ	\N	2025-08-03 06:15:50.695004	2025-08-05 20:17:59.842	\N	0.00	\N	0.00	\N	\N	\N
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.leave_requests (id, leave_number, staff_id, manager_id, leave_type, start_date, end_date, total_days, reason, status, applied_date, reviewed_date, review_comments, attachments, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: medical_appointments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_appointments (id, appointment_number, patient_id, doctor_id, store_id, appointment_date, appointment_type, status, notes, symptoms, diagnosis, treatment, next_follow_up, duration, custom_fields, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: medical_interventions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_interventions (id, code, name, description, category, price, duration, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: medical_invoice_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_invoice_items (id, invoice_id, item_type, item_id, item_name, description, quantity, unit_price, total_price, created_at) FROM stdin;
\.


--
-- Data for Name: medical_invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.medical_invoices (id, invoice_number, patient_id, doctor_id, appointment_id, prescription_id, store_id, invoice_date, due_date, subtotal, tax_amount, discount_amount, total, payment_status, payment_method, payment_date, notes, qr_code, custom_fields, created_at, updated_at, applied_coupon_code) FROM stdin;
77905f81-4fb7-44f6-a1a7-31a26e2a3ce9	INV-TEST-123	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	\N	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-02 16:23:36.447667	\N	100.00	8.00	0.00	108.00	paid	cash	2025-08-02 16:21:00	Test invoice	\N	\N	2025-08-02 16:23:36.447667	2025-08-02 16:23:36.447667	\N
2350e53c-1ded-4ef7-a476-6a4977e05233	INV-1754151892135	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	\N	\N	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-02 16:24:54.427997	\N	99.12	7.93	0.00	107.05	paid	cash	2025-08-02 16:24:52.135	Payment for follow-up appointment	\N	\N	2025-08-02 16:24:54.427997	2025-08-02 16:24:54.427997	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, recipient_id, recipient_type, title, message, type, priority, is_read, read_at, sent_at, related_type, related_id, related_data, channels, delivery_status, created_at) FROM stdin;
\.


--
-- Data for Name: patient_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.patient_history (id, patient_id, doctor_id, record_type, record_id, record_date, title, description, metadata, created_at) FROM stdin;
873a5345-2765-4eb0-b30a-919fb4947c6c	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	invoice	77905f81-4fb7-44f6-a1a7-31a26e2a3ce9	2025-08-02 16:23:36.616525	Invoice INV-TEST-123	Medical invoice for $108.00 - paid	{"amount": "108.00", "invoiceNumber": "INV-TEST-123", "paymentStatus": "paid"}	2025-08-02 16:23:36.616525
371b340e-5fe1-4de6-b805-bce345d877de	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	invoice	2350e53c-1ded-4ef7-a476-6a4977e05233	2025-08-02 16:24:54.545263	Invoice INV-1754151892135	Medical invoice for $107.05 - paid	{"amount": "107.05", "invoiceNumber": "INV-1754151892135", "paymentStatus": "paid"}	2025-08-02 16:24:54.545263
f7611c56-0b99-4e15-b6a9-eece8305818e	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	prescription	38712b73-3124-4ad2-bd52-076c33186eb9	2025-08-02 16:27:34.149509	Prescription RX-975619	eye_examination prescription created	{"diagnosis": "Testing dataClinical Diagnosis\\n", "prescriptionType": "eye_examination"}	2025-08-02 16:27:34.149509
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.patients (id, patient_code, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, emergency_phone, blood_group, allergies, medical_history, insurance_provider, insurance_number, current_medications, previous_eye_conditions, last_eye_exam_date, current_prescription, risk_factors, family_medical_history, smoking_status, alcohol_consumption, exercise_frequency, right_eye_sphere, right_eye_cylinder, right_eye_axis, left_eye_sphere, left_eye_cylinder, left_eye_axis, pupillary_distance, doctor_notes, treatment_plan, follow_up_date, medical_alerts, is_active, loyalty_tier, loyalty_points, custom_fields, created_at, updated_at, username, password, national_id, nis_number, insurance_coupons) FROM stdin;
f50689ad-023b-4c75-b85c-07f4aa0f75b8	PAT-384641	Test	Patient 1	1988-05-12	male	5235235	\N	khk	\N	\N	AB+	rqr	rqr	rqrq	rqrq	\N	\N	\N	\N	low	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	bronze	0	{}	2025-07-31 17:03:57.485178	2025-07-31 17:03:57.485178	\N	\N	\N	\N	[]
b5ca95fd-579b-4300-95e4-e6f5ec293805	PAT-1754143139756	Patient	XYZ	1988-04-12	male	12345678	testpatient@gmail.com	Patient	Patient Emergency Contact	215151	O+	XYX Allergies\nABC Allergies	ABC Medical History\nXyz Medical History	ABC Insurance 	IN0023552	\N	\N	\N	\N	low	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	bronze	10	\N	2025-08-02 14:01:06.526137	2025-08-02 14:01:06.526137	\N	\N	\N	\N	[]
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payment_transactions (id, transaction_number, transaction_type, source_type, source_id, customer_id, payer_id, payer_name, payer_type, amount, currency, payment_method, payment_processor, processor_transaction_id, bank_account, check_number, status, description, notes, fee_amount, net_amount, transaction_date, processed_date, reconciled_date, is_reconciled, created_by, created_at, updated_at) FROM stdin;
b9d2691f-a330-4cae-be8a-9b877908e089	TXN-2025-001	income	appointment	APT-001	\N	\N	John Doe Patient	customer	250.00	USD	card	\N	\N	\N	\N	completed	Eye Examination Payment	\N	0.00	247.25	2025-01-15 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
aadfd9be-5262-42e2-9048-cc2f551e8858	TXN-2025-002	income	sale	INV-789319	\N	\N	Sarah Johnson Customer	customer	800.00	USD	card	\N	\N	\N	\N	completed	Frames + Lenses Purchase	\N	0.00	791.20	2025-01-16 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
efe794db-bfba-48d9-9c5d-8e4a3c00c3b8	TXN-2025-003	income	appointment	APT-002	\N	\N	Mike Wilson Patient	customer	150.00	USD	cash	\N	\N	\N	\N	completed	Contact Lens Fitting	\N	0.00	150.00	2025-01-17 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
018898c9-e0f2-4e6c-9364-574cd91b9c82	TXN-2025-004	income	sale	INV-789320	\N	\N	Lisa Chen Customer	customer	280.00	USD	card	\N	\N	\N	\N	completed	Sunglasses Purchase	\N	0.00	276.86	2025-01-18 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
40d92a83-cbdd-47c0-928e-d8d284e353d7	TXN-2025-005	income	appointment	APT-003	\N	\N	Robert Davis Patient	customer	300.00	USD	insurance	\N	\N	\N	\N	completed	Diabetic Eye Screening	\N	0.00	285.00	2025-01-20 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
c3a7ce54-1982-4027-a159-1061ab997d8a	TXN-2025-E001	expense	manual	RENT-JAN-2025	\N	\N	Manhattan Properties LLC	supplier	8500.00	USD	bank_transfer	\N	\N	\N	\N	completed	January Rent Payment	\N	0.00	8500.00	2025-01-01 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
7bfcf502-0e33-4b0f-b471-149ddbd1206f	TXN-2025-E002	expense	manual	UTIL-JAN-2025	\N	\N	ConEd Utilities	supplier	1850.00	USD	bank_transfer	\N	\N	\N	\N	completed	January Utilities	\N	0.00	1850.00	2025-01-15 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
78b48b95-2efa-4c3c-94a1-92a836bd5943	TXN-2025-E003	expense	payroll	PAY-2025-001	\N	\N	Dr. Smita Ghosh	employee	68897.00	USD	bank_transfer	\N	\N	\N	\N	completed	January Net Salary Payment	\N	0.00	68897.00	2025-01-31 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
8bea9c51-c872-440e-94fe-b0f9a3865d01	TXN-2025-E004	expense	manual	INS-JAN-2025	\N	\N	Professional Insurance Corp	supplier	2400.00	USD	bank_transfer	\N	\N	\N	\N	completed	Monthly Insurance Premium	\N	0.00	2400.00	2025-01-20 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
a00d8d8a-ee27-43f6-9eff-6757aba359ab	TXN-2025-E005	expense	purchase	PO-2025-001	\N	\N	MedSupply Solutions	supplier	850.00	USD	card	\N	\N	\N	\N	completed	Medical Supplies Purchase	\N	0.00	842.15	2025-01-05 00:00:00	\N	\N	f	45761289	2025-08-06 02:37:44.294162	2025-08-06 02:37:44.294162
\.


--
-- Data for Name: payroll; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payroll (id, payroll_number, staff_id, pay_period, pay_month, pay_year, pay_date, basic_salary, allowances, deductions, overtime, bonus, gross_salary, total_deductions, net_salary, working_days, present_days, absent_days, leaves_taken, status, processed_by, processed_date, payslip_generated, payslip_url, qr_code, created_at, updated_at) FROM stdin;
1bed7d73-e43a-4381-8237-da1610697c8e	PAY-2025-001	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	January 2025	1	2025	2025-01-31	85000.00	{"phone": 150, "housing": 1500, "medical": 2500, "transport": 800, "performance": 1000}	{"dental": 120, "vision": 80, "pension": 4250, "medicare": 1233, "state_tax": 3400, "federal_tax": 12750, "social_security": 5270, "health_insurance": 850}	2400.00	5000.00	96850.00	27953.00	68897.00	22	22	0	0	processed	\N	2025-08-06 02:36:50.116558	t	\N	\N	2025-08-06 02:36:50.116558	2025-08-06 02:36:50.116558
4df84d96-ae5b-4c62-a76b-d892c0ea98da	PAY-2024-012	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	December 2024	12	2024	2024-12-31	85000.00	{"phone": 150, "housing": 1500, "medical": 2500, "year_end": 2000, "transport": 800}	{"dental": 120, "vision": 80, "pension": 4250, "medicare": 1233, "state_tax": 3400, "federal_tax": 12750, "social_security": 5270, "health_insurance": 850}	3600.00	8000.00	102950.00	27953.00	74997.00	22	21	1	1	processed	\N	2024-12-31 23:59:59	t	\N	\N	2025-08-06 02:36:50.116558	2025-08-06 02:36:50.116558
\.


--
-- Data for Name: prescription_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prescription_items (id, prescription_id, product_id, item_type, item_name, quantity, unit_price, total_price, notes, created_at) FROM stdin;
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prescriptions (id, prescription_number, patient_id, doctor_id, appointment_id, store_id, prescription_date, prescription_type, visual_acuity_right_eye, visual_acuity_left_eye, sphere_right, cylinder_right, axis_right, add_right, sphere_left, cylinder_left, axis_left, add_left, pd_distance, pd_near, pd_far, diagnosis, treatment, advice, next_follow_up, notes, custom_fields, status, qr_code, created_at, updated_at) FROM stdin;
38712b73-3124-4ad2-bd52-076c33186eb9	RX-975619	b5ca95fd-579b-4300-95e4-e6f5ec293805	\N	ab38ffcc-3d57-414f-9f30-55334d1b0c3c	5ff902af-3849-4ea6-945b-4d49175d6638	2025-08-02 16:26:15.619	eye_examination	32	3	-0.25	0.25	1	0.25	-0.25	0.25	1	-2.50	2.0	2.0	2.0	Testing dataClinical Diagnosis\n	Treatment Plan & Recommendations testing 	Patient Advice & Instruction rq	2025-11-20	additional Notes test	\N	active	\N	2025-08-02 16:27:33.882466	2025-08-02 16:27:33.882466
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, description, sku, category_id, supplier_id, price, cost_price, product_type, reorder_level, is_active, custom_fields, created_at, updated_at, barcode) FROM stdin;
00d6d248-ae81-4560-93d7-50625ac8e478	Test	Testing product	Aff05235	\N	\N	2999.00	25000.00	frames	10	t	\N	2025-07-30 23:26:25.803202	2025-07-31 01:09:53.637	\N
2665df4d-a238-4937-b141-3b04b72c6c54	PAFa	Test Product with Barcode	35252AD	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	999.00	900.00	frames	10	t	\N	2025-08-03 07:19:31.27278	2025-08-03 07:19:31.27278	BC05538963
def4cd2d-77f0-4242-97bb-48e6aa080259	Test-Frame Model-X2	Test-Frame Model-X2	FR-298488	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	299.00	290.00	frames	10	t	\N	2025-08-05 01:45:38.007667	2025-08-05 01:45:38.007667	BC58316800
9d1814d9-e54a-43ed-b5a6-1aaf170ea319	Test Frame Model-X3	Testing the fixed product creation flow	TF-X3-001	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	249.99	150.00	frames	12	t	\N	2025-08-05 01:47:04.937203	2025-08-05 01:47:04.937203	123456789013
a38a3a4b-a158-4c81-bc19-ecf34634f340	Ray ban sunglasses	ray ban sunglasses testing	FR-542638	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	999.00	900.00	frames	10	t	\N	2025-08-04 23:03:27.889418	2025-08-04 23:03:27.889418	BC48561250
2aa5d1a6-965b-4bd3-8470-38f652de0b2e	Ray-ban sunglasses AB2	Ray-ban sunglasses AB2	FR-763669	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	699.00	600.00	sunglasses	10	t	\N	2025-08-04 23:40:16.520258	2025-08-04 23:40:16.520258	BC50781510
96e508eb-881a-410b-9384-b4a7f3b9b737	Ray-Ban ST1	Ray-Ban ST1	FR-037300	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	399.00	300.00	frames	10	t	\N	2025-08-04 23:45:04.436957	2025-08-04 23:45:04.436957	BC51074186
28c57ade-b32b-4a28-af6e-43a5dad85e08	Ray-Ban ST9055	Ray-Ban ST9055	FR-576382	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	299.00	200.00	frames	10	t	\N	2025-08-04 23:53:38.833347	2025-08-04 23:53:38.833347	BC51591749
1e509b88-ae55-4e36-a2e5-2c4ffdfa3266	Ray-Ban9042	Ray-Ban9042	FR-959591	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	199.00	190.00	frames	10	t	\N	2025-08-04 23:59:56.60888	2025-08-04 23:59:56.60888	BC51973351
1cf08da2-abb7-4ad8-90b0-2c99f79968ab	Test Product Clean	Testing clean creation	TEST-12345	\N	\N	150.00	75.00	frames	5	t	\N	2025-08-05 00:01:22.434685	2025-08-05 00:01:22.434685	
eaa329ee-c275-4bc8-b6d7-8ba7dea274a4	Ray-Ban 8943	Ray-Ban 8943	FR-032841	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	299.00	200.00	frames	10	t	\N	2025-08-05 01:07:51.76044	2025-08-05 01:07:51.76044	BC56052750
ef205a39-d9f4-49f0-a0a0-b61c9b8ac618	Ray-Ban942x	Ray-Ban942x	FR-691035	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	299.00	200.00	frames	10	t	\N	2025-08-05 01:35:30.733762	2025-08-05 01:35:30.733762	BC57705103
09dea246-3141-4f3d-9e3e-a010c9ab0f71	Test Frame Model-X1	Premium optical frame for testing	TF-X1-001	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	199.99	120.00	frames	15	t	\N	2025-08-05 01:42:53.313	2025-08-05 01:42:59.738	123456789012
0eed9a96-7226-4a02-adb0-b58c1870fdfb	RayBan-3422	RayBan-3422	FR-550466	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	199.00	190.00	frames	10	t	\N	2025-08-05 01:16:28.268	2025-08-05 03:18:31.887	BC56564289
6bade2fd-2c5a-49ef-bd8e-26702e44704b	ABC Crane	Crane testing	CA43224	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	999.00	175.00	frames	10	t	\N	2025-08-03 07:28:23.788	2025-08-05 04:10:02.039	BC06074737
b47a5663-7917-4076-b9d3-76f678ad5988	Ray-Ban9832	Ray-Ban9832	FR-524625	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	899.00	250.00	frames	10	t	\N	2025-08-05 00:09:22.832	2025-08-05 04:12:48.784	BC52542537
c33f14b5-b8c2-468b-afc2-d036ae58a2de	Ray-Ban@23225	Ray-Ban@23225	FR-581939	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	1877.00	300.00	frames	10	t	\N	2025-08-05 01:51:26.543	2025-08-05 04:18:48.672	BC58596873
6ab10edd-c2a4-4d47-a630-c3f17f7d0d49	Ray-ban sunglasses A2	Ray-ban sunglasses A2	FR-320695	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	989.00	800.00	sunglasses	10	t	\N	2025-08-04 23:33:12.707	2025-08-05 03:16:35.088	BC50344395
8bc389d6-c868-46c6-8f76-1ba004277605	RayBen	faf	RB101	05b7e55f-ce54-4cdf-bc4f-bbf30062f531	eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	1999.00	1500.00	frames	15	t	\N	2025-07-31 01:10:45.012	2025-08-05 03:16:35.652	\N
\.


--
-- Data for Name: profit_loss_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.profit_loss_entries (id, entry_date, entry_type, category, sub_category, source_type, source_id, description, amount, quantity, unit_amount, store_id, customer_id, product_id, staff_id, fiscal_year, fiscal_period, created_by, created_at) FROM stdin;
4dc2d92c-26df-4c62-973e-164c827cf3c4	2025-01-15 00:00:00	revenue	services	eye_exams	appointment	APT-001	Comprehensive Eye Examination	250.00	1	250.00	5ff902af-3849-4ea6-945b-4d49175d6638	f8e50809-954c-4ff6-b1c2-a014218b1b36	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
ba6f7f82-8c2d-4115-8842-ba0e22040073	2025-01-16 00:00:00	revenue	sales	frames	sale	INV-789319	Designer Frames - Ray-Ban	350.00	1	350.00	5ff902af-3849-4ea6-945b-4d49175d6638	f8e50809-954c-4ff6-b1c2-a014218b1b36	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
e2ef391f-3138-478d-8352-11a5e160e236	2025-01-16 00:00:00	revenue	sales	lenses	sale	INV-789319	Progressive Lenses	450.00	1	450.00	5ff902af-3849-4ea6-945b-4d49175d6638	f8e50809-954c-4ff6-b1c2-a014218b1b36	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
e9b8a625-a1cd-48ba-b305-7c77d8f0679d	2025-01-17 00:00:00	revenue	services	contact_fitting	appointment	APT-002	Contact Lens Fitting & Training	150.00	1	150.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
a244cd5d-d569-434b-b265-5a28db1c7ed8	2025-01-18 00:00:00	revenue	sales	sunglasses	sale	INV-789320	Polarized Sunglasses - Oakley	280.00	1	280.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
7b5c6eaa-7f67-4174-930c-60b2563a0ea0	2025-01-20 00:00:00	revenue	services	specialty_exam	appointment	APT-003	Diabetic Eye Screening	300.00	1	300.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
9574da19-3768-43f0-81f8-60344593e8a3	2025-01-22 00:00:00	revenue	sales	contact_lenses	sale	INV-789321	6-Month Contact Lens Supply	320.00	6	53.33	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
1e3a251d-a188-4785-ad93-af99d47e6371	2025-01-25 00:00:00	revenue	services	vision_therapy	appointment	APT-004	Vision Therapy Session	180.00	1	180.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
5271518c-2e29-4d5d-9ed1-711d1851b853	2025-01-28 00:00:00	revenue	sales	accessories	sale	INV-789322	Cleaning Kit & Case Bundle	65.00	1	65.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
a1bbf8da-7d26-4c98-8090-1bb10fa0f4d9	2025-01-30 00:00:00	revenue	services	emergency_exam	appointment	APT-005	Emergency Eye Examination	400.00	1	400.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:13.191443
049a082d-3d16-4381-ada1-6c50d659c8e4	2025-01-16 00:00:00	cogs	inventory	frames_cost	sale	INV-789319	Cost of Designer Frames - Ray-Ban	140.00	1	140.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	6bade2fd-2c5a-49ef-bd8e-26702e44704b	\N	2025	1	45761289	2025-08-06 02:37:13.191443
b1da2846-cc1e-4311-9dae-9b5d19e4ebf5	2025-01-16 00:00:00	cogs	inventory	lenses_cost	sale	INV-789319	Cost of Progressive Lenses	180.00	1	180.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	6bade2fd-2c5a-49ef-bd8e-26702e44704b	\N	2025	1	45761289	2025-08-06 02:37:13.191443
5f9406f6-e246-4e05-ad79-b6ea27600fc8	2025-01-18 00:00:00	cogs	inventory	sunglasses_cost	sale	INV-789320	Cost of Polarized Sunglasses - Oakley	112.00	1	112.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	6bade2fd-2c5a-49ef-bd8e-26702e44704b	\N	2025	1	45761289	2025-08-06 02:37:13.191443
1d732cdb-75c9-48f7-abdd-006d411d3059	2025-01-22 00:00:00	cogs	inventory	contacts_cost	sale	INV-789321	Cost of Contact Lenses Supply	128.00	6	21.33	5ff902af-3849-4ea6-945b-4d49175d6638	\N	6bade2fd-2c5a-49ef-bd8e-26702e44704b	\N	2025	1	45761289	2025-08-06 02:37:13.191443
859db7f4-3076-4c7a-a51a-d1d52844e956	2025-01-28 00:00:00	cogs	inventory	accessories_cost	sale	INV-789322	Cost of Cleaning Kit & Case Bundle	26.00	1	26.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	6bade2fd-2c5a-49ef-bd8e-26702e44704b	\N	2025	1	45761289	2025-08-06 02:37:13.191443
9dac10df-738c-4a52-9ccc-3be2662b7087	2025-01-31 00:00:00	expense	operating	payroll	payroll	PAY-2025-001	Dr. Smita Ghosh - January Salary & Benefits	96850.00	1	96850.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	1bdff802-b8a1-4bbb-8610-f79c2881b1ee	2025	1	45761289	2025-08-06 02:37:32.962406
e2a3c956-d547-4bc5-870a-8971adfed7d8	2025-01-01 00:00:00	expense	operating	rent	manual	RENT-JAN-2025	Monthly Clinic Rent - Main Location	8500.00	1	8500.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
df3d4f6d-226b-45e4-b772-78fd868ac114	2025-01-15 00:00:00	expense	operating	utilities	manual	UTIL-JAN-2025	Electricity, Water, Gas - January	1850.00	1	1850.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
86f603f0-2064-45bb-bf00-ddde9eb2730a	2025-01-20 00:00:00	expense	operating	insurance	manual	INS-JAN-2025	Professional Liability & Property Insurance	2400.00	1	2400.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
76e0809a-895d-4c90-818c-3e630dfdde6d	2025-01-05 00:00:00	expense	operating	medical_supplies	purchase	PO-2025-001	Disposable Eye Exam Supplies	850.00	1	850.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
4d6e97c9-71dc-4071-b489-d2f141c565ba	2025-01-10 00:00:00	expense	operating	equipment_maintenance	manual	MAINT-JAN-2025	Calibration & Maintenance of Exam Equipment	1200.00	1	1200.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
d8bf123f-321b-47c7-9f06-c7549ddbb2e7	2025-01-08 00:00:00	expense	operating	marketing	manual	MKTG-JAN-2025	Google Ads & Local Directory Listings	650.00	1	650.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
cc66fc17-c30c-4bc9-bebb-2024a598bf2b	2025-01-12 00:00:00	expense	operating	office_supplies	purchase	PO-2025-002	Office Supplies & Patient Forms	320.00	1	320.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
b2adeea1-e6b5-4c01-a192-491e210b5ac9	2025-01-25 00:00:00	expense	operating	professional_services	manual	PROF-JAN-2025	Accounting & Legal Consultation	1800.00	1	1800.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
055f247e-4ef5-4ded-a318-a95e81f3ca63	2025-01-03 00:00:00	expense	operating	technology	manual	TECH-JAN-2025	Software Subscriptions & IT Support	980.00	1	980.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
48889c76-30f8-4945-ade7-c2d39e5f204d	2025-01-15 00:00:00	expense	operating	communications	manual	COMM-JAN-2025	Phone, Internet & Patient Communication System	450.00	1	450.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
0476e1fb-ff3a-4a2e-aadb-ca07447bf06b	2025-01-28 00:00:00	expense	operating	training	manual	TRAIN-JAN-2025	Staff Continuing Education & Certification	1500.00	1	1500.00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	\N	\N	2025	1	45761289	2025-08-06 02:37:32.962406
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_permissions (id, role_name, module, permissions, description, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sale_items (id, sale_id, product_id, quantity, unit_price, total_price) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sales (id, store_id, customer_id, staff_id, subtotal, tax_amount, total, payment_method, payment_status, notes, created_at) FROM stdin;
3f0a53da-bcfc-4df7-8ed5-0f52a7d95a00	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	150.00	12.00	162.00	cash	completed	Test quick sale - first sale	2025-08-03 03:23:34.270857
fc9b81df-9be7-46ed-b873-ec9b5b29e83d	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	2637.08	210.97	2848.05	cash	completed	Quick sale for $2848.05 - Test transaction	2025-08-03 04:59:28.027423
bc8f542c-66e0-423e-af58-2435d8fa960e	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	1000.00	80.00	1080.00	cash	completed	Manual test quick sale $1080	2025-08-03 05:04:17.226888
c58bfc60-3c4d-409d-9b44-a8506ea50df0	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	500.00	40.00	540.00	cash	completed	Quick sale for Patient XYZ - Test for patient profile	2025-08-03 05:08:42.392936
aca43781-020e-423d-9a91-b56060b7d7d7	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	250.00	20.00	270.00	cash	completed	Quick sale for Patient XYZ (PAT-1754143139756) - Prescription glasses	2025-08-03 05:10:43.111749
36cb671c-1837-423a-a395-72a622c6e292	5ff902af-3849-4ea6-945b-4d49175d6638	\N	45761289	3456.17	344.62	3800.79	cash	completed	Test quick sale $3800.79 - Troubleshooting missing invoice	2025-08-03 05:13:38.930987
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff (id, staff_code, employee_id, first_name, last_name, email, phone, address, "position", department, store_id, manager_id, hire_date, termination_date, status, role, permissions, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, avatar, date_of_birth, gender, nationality, custom_fields, created_at, updated_at, username, password, minimum_working_hours, daily_working_hours, blood_group, staff_photo, documents) FROM stdin;
1bdff802-b8a1-4bbb-8610-f79c2881b1ee	STF-304783	EMP-304783	Dr. Smita	Ghosh	doctor@gmail.com	9993232	 62 Sandy Babb St, Georgetown guyana	doctor	Eye Care	5ff902af-3849-4ea6-945b-4d49175d6638	\N	2025-08-02	\N	active	doctor	[]	Doctor EM	12414141	\N	\N	1985-10-25	female		{}	2025-08-02 14:04:22.576953	2025-08-06 02:19:20.253	\N	\N	8.00	8.00	A+	https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face	[]
\.


--
-- Data for Name: staff_profiles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff_profiles (id, user_id, staff_code, job_title, department, specialization, license_number, permissions, work_schedule, salary, hire_date, status, supervisor_id, emergency_contact, qualifications, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: store_inventory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.store_inventory (id, store_id, product_id, quantity, last_restocked, updated_at, reserved_quantity, min_stock, max_stock, location) FROM stdin;
1b901de0-678d-4aa9-af14-cc8886f8d8f4	5ff902af-3849-4ea6-945b-4d49175d6638	1cf08da2-abb7-4ad8-90b0-2c99f79968ab	10	2025-08-05 00:01:57.778	2025-08-05 00:01:57.795686	0	0	100	\N
62d3863e-a82f-44cc-b23b-e43cd6585916	5ff902af-3849-4ea6-945b-4d49175d6638	6ab10edd-c2a4-4d47-a630-c3f17f7d0d49	2	2025-08-05 03:16:35.298	2025-08-05 03:16:35.298	0	0	100	\N
251c78a4-a8c3-4160-ac06-a6e17f588038	5ff902af-3849-4ea6-945b-4d49175d6638	8bc389d6-c868-46c6-8f76-1ba004277605	8	2025-08-05 03:16:35.863	2025-08-05 03:16:35.863	0	0	100	\N
da9acbcc-8502-42a9-87fa-fd6c7a4e33b7	5ff902af-3849-4ea6-945b-4d49175d6638	0eed9a96-7226-4a02-adb0-b58c1870fdfb	14	2025-08-05 03:18:32.099	2025-08-05 03:18:32.099	0	0	100	\N
29fcd8fa-458a-4f2a-b127-ef751732a9a1	5ff902af-3849-4ea6-945b-4d49175d6638	6bade2fd-2c5a-49ef-bd8e-26702e44704b	8	2025-08-05 04:10:02.267	2025-08-05 04:10:02.285852	0	0	100	\N
8ef36719-15e7-47a1-810e-00e4296d0a9e	5ff902af-3849-4ea6-945b-4d49175d6638	b47a5663-7917-4076-b9d3-76f678ad5988	4	2025-08-05 04:12:49.001	2025-08-05 04:12:49.001	0	0	100	\N
16df1fa8-45f3-432a-9422-467cd4448a3a	5ff902af-3849-4ea6-945b-4d49175d6638	c33f14b5-b8c2-468b-afc2-d036ae58a2de	33	2025-08-05 04:18:48.891	2025-08-05 04:18:48.891	0	0	100	\N
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stores (id, name, address, city, state, zip_code, phone, email, manager_id, is_active, timezone, opening_hours, custom_fields, created_at, updated_at) FROM stdin;
5ff902af-3849-4ea6-945b-4d49175d6638	Store1	Test address for store 	GT	GG	00	12441	store@exmple.com	\N	t	America/New_York	rq	{"socialMedia": {}, "detailedOpeningHours": {"friday": {}, "monday": {}, "sunday": {}, "tuesday": {}, "saturday": {}, "thursday": {}, "wednesday": {}}}	2025-07-31 01:09:37.921791	2025-08-05 21:22:45.811
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.suppliers (id, name, contact_person, email, phone, address, created_at) FROM stdin;
eabbf8f9-6e2e-47b5-b0dd-d2b30f2c2471	Test Supplier	Supplier 1	Supplier@gmail.com	523525252	124141	2025-07-30 23:27:24.66404
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_settings (id, category, key, value, is_encrypted, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, role, is_active, last_login, created_at, updated_at, username, password_hash) FROM stdin;
45761289	zanheaa7@gmail.com	Xeen	faf	\N	staff	t	\N	2025-07-30 18:08:05.887445	2025-07-31 00:07:27.559	\N	\N
1bdff802-b8a1-4bbb-8610-f79c2881b1ee	doctor@gmail.com	Dr. Smita	Ghosh	\N	doctor	t	\N	2025-08-02 14:15:35.337646	2025-08-02 14:15:35.337646	\N	\N
\.


--
-- Name: account_categories account_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.account_categories
    ADD CONSTRAINT account_categories_code_key UNIQUE (code);


--
-- Name: account_categories account_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.account_categories
    ADD CONSTRAINT account_categories_pkey PRIMARY KEY (id);


--
-- Name: appointment_actions appointment_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_actions
    ADD CONSTRAINT appointment_actions_pkey PRIMARY KEY (id);


--
-- Name: appointment_prescriptions appointment_prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_pkey PRIMARY KEY (id);


--
-- Name: appointment_prescriptions appointment_prescriptions_prescription_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_prescription_code_unique UNIQUE (prescription_code);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: chart_of_accounts chart_of_accounts_account_number_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_account_number_key UNIQUE (account_number);


--
-- Name: chart_of_accounts chart_of_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);


--
-- Name: communication_log communication_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.communication_log
    ADD CONSTRAINT communication_log_pkey PRIMARY KEY (id);


--
-- Name: custom_fields_config custom_fields_config_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_fields_config
    ADD CONSTRAINT custom_fields_config_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_unique UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_doctor_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_doctor_code_unique UNIQUE (doctor_code);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: general_ledger_entries general_ledger_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.general_ledger_entries
    ADD CONSTRAINT general_ledger_entries_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_leave_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_number_unique UNIQUE (leave_number);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: medical_appointments medical_appointments_appointment_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_appointment_number_unique UNIQUE (appointment_number);


--
-- Name: medical_appointments medical_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_pkey PRIMARY KEY (id);


--
-- Name: medical_interventions medical_interventions_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_interventions
    ADD CONSTRAINT medical_interventions_code_unique UNIQUE (code);


--
-- Name: medical_interventions medical_interventions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_interventions
    ADD CONSTRAINT medical_interventions_pkey PRIMARY KEY (id);


--
-- Name: medical_invoice_items medical_invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoice_items
    ADD CONSTRAINT medical_invoice_items_pkey PRIMARY KEY (id);


--
-- Name: medical_invoices medical_invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: medical_invoices medical_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patient_history patient_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_history
    ADD CONSTRAINT patient_history_pkey PRIMARY KEY (id);


--
-- Name: patients patients_patient_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_patient_code_unique UNIQUE (patient_code);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_transaction_number_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_transaction_number_key UNIQUE (transaction_number);


--
-- Name: payroll payroll_payroll_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_payroll_number_unique UNIQUE (payroll_number);


--
-- Name: payroll payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_pkey PRIMARY KEY (id);


--
-- Name: prescription_items prescription_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_prescription_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_prescription_number_unique UNIQUE (prescription_number);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_unique UNIQUE (sku);


--
-- Name: profit_loss_entries profit_loss_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: staff staff_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_unique UNIQUE (email);


--
-- Name: staff staff_employee_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_employee_id_unique UNIQUE (employee_id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_profiles staff_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_pkey PRIMARY KEY (id);


--
-- Name: staff_profiles staff_profiles_staff_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_staff_code_unique UNIQUE (staff_code);


--
-- Name: staff staff_staff_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_staff_code_unique UNIQUE (staff_code);


--
-- Name: staff staff_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_username_key UNIQUE (username);


--
-- Name: store_inventory store_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: products_barcode_unique; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX products_barcode_unique ON public.products USING btree (barcode) WHERE (barcode IS NOT NULL);


--
-- Name: appointment_actions appointment_actions_appointment_id_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_actions
    ADD CONSTRAINT appointment_actions_appointment_id_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: appointment_actions appointment_actions_doctor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_actions
    ADD CONSTRAINT appointment_actions_doctor_id_users_id_fk FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: appointment_prescriptions appointment_prescriptions_appointment_id_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_appointment_id_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: appointment_prescriptions appointment_prescriptions_doctor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_doctor_id_users_id_fk FOREIGN KEY (doctor_id) REFERENCES public.users(id);


--
-- Name: appointment_prescriptions appointment_prescriptions_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointment_prescriptions
    ADD CONSTRAINT appointment_prescriptions_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: appointments appointments_assigned_doctor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_assigned_doctor_id_users_id_fk FOREIGN KEY (assigned_doctor_id) REFERENCES public.users(id);


--
-- Name: appointments appointments_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: appointments appointments_staff_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_staff_id_users_id_fk FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: appointments appointments_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: attendance attendance_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: attendance attendance_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: chart_of_accounts chart_of_accounts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.account_categories(id);


--
-- Name: communication_log communication_log_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.communication_log
    ADD CONSTRAINT communication_log_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: doctors doctors_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: general_ledger_entries general_ledger_entries_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.general_ledger_entries
    ADD CONSTRAINT general_ledger_entries_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: general_ledger_entries general_ledger_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.general_ledger_entries
    ADD CONSTRAINT general_ledger_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: invoice_items invoice_items_invoice_id_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_invoices_id_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: invoice_items invoice_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: invoices invoices_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: invoices invoices_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: leave_requests leave_requests_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: medical_appointments medical_appointments_doctor_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_doctor_id_staff_id_fk FOREIGN KEY (doctor_id) REFERENCES public.staff(id);


--
-- Name: medical_appointments medical_appointments_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: medical_appointments medical_appointments_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: medical_invoice_items medical_invoice_items_invoice_id_medical_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoice_items
    ADD CONSTRAINT medical_invoice_items_invoice_id_medical_invoices_id_fk FOREIGN KEY (invoice_id) REFERENCES public.medical_invoices(id);


--
-- Name: medical_invoices medical_invoices_appointment_id_medical_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_appointment_id_medical_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.medical_appointments(id);


--
-- Name: medical_invoices medical_invoices_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: medical_invoices medical_invoices_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: medical_invoices medical_invoices_prescription_id_prescriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_prescription_id_prescriptions_id_fk FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: medical_invoices medical_invoices_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.medical_invoices
    ADD CONSTRAINT medical_invoices_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: notifications notifications_recipient_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_staff_id_fk FOREIGN KEY (recipient_id) REFERENCES public.staff(id);


--
-- Name: patient_history patient_history_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_history
    ADD CONSTRAINT patient_history_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: patient_history patient_history_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.patient_history
    ADD CONSTRAINT patient_history_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: payment_transactions payment_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: payment_transactions payment_transactions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: payroll payroll_processed_by_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_processed_by_staff_id_fk FOREIGN KEY (processed_by) REFERENCES public.staff(id);


--
-- Name: payroll payroll_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: prescription_items prescription_items_prescription_id_prescriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_prescription_id_prescriptions_id_fk FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id);


--
-- Name: prescription_items prescription_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescription_items
    ADD CONSTRAINT prescription_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: prescriptions prescriptions_appointment_id_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_appointment_id_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: prescriptions prescriptions_doctor_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_id_staff_id_fk FOREIGN KEY (doctor_id) REFERENCES public.staff(id);


--
-- Name: prescriptions prescriptions_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: prescriptions prescriptions_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: products products_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_supplier_id_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: profit_loss_entries profit_loss_entries_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: profit_loss_entries profit_loss_entries_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: profit_loss_entries profit_loss_entries_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: profit_loss_entries profit_loss_entries_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: profit_loss_entries profit_loss_entries_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: sale_items sale_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sale_items sale_items_sale_id_sales_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_sales_id_fk FOREIGN KEY (sale_id) REFERENCES public.sales(id);


--
-- Name: sales sales_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: sales sales_staff_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_staff_id_users_id_fk FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: sales sales_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: staff_profiles staff_profiles_supervisor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_supervisor_id_users_id_fk FOREIGN KEY (supervisor_id) REFERENCES public.users(id);


--
-- Name: staff_profiles staff_profiles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_profiles
    ADD CONSTRAINT staff_profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: staff staff_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: store_inventory store_inventory_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: store_inventory store_inventory_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.store_inventory
    ADD CONSTRAINT store_inventory_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: stores stores_manager_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_manager_id_users_id_fk FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

