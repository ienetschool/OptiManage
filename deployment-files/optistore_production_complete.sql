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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


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
    applied_coupon_code character varying(50),
    coupon_discount numeric(10,2) DEFAULT '0'::numeric,
    coupon_type character varying(30),
    coupon_description text,
    notes text,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    applied_coupon_code character varying(50),
    coupon_discount numeric(10,2) DEFAULT '0'::numeric,
    coupon_type character varying(30),
    coupon_description text,
    notes text,
    qr_code character varying(255),
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    username character varying(50),
    password character varying(255),
    national_id character varying(50),
    nis_number character varying(50),
    insurance_coupons jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    loyalty_tier character varying(20) DEFAULT 'bronze'::character varying,
    loyalty_points integer DEFAULT 0,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
-- Name: product_costs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_costs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    product_id character varying NOT NULL,
    store_id character varying NOT NULL,
    cost_type character varying NOT NULL,
    unit_cost numeric(10,4) NOT NULL,
    quantity integer NOT NULL,
    total_cost numeric(15,2) NOT NULL,
    purchase_order_id character varying,
    supplier_id character varying,
    effective_date timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.product_costs OWNER TO neondb_owner;

--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    sku character varying NOT NULL,
    barcode character varying,
    category_id character varying,
    supplier_id character varying,
    price numeric(10,2) NOT NULL,
    cost_price numeric(10,2),
    product_type character varying DEFAULT 'frames'::character varying,
    reorder_level integer DEFAULT 10,
    is_active boolean DEFAULT true,
    custom_fields jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchase_order_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    discount numeric(5,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    received_quantity integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.purchase_order_items OWNER TO neondb_owner;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchase_orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_number character varying NOT NULL,
    supplier_id character varying NOT NULL,
    store_id character varying NOT NULL,
    order_date timestamp without time zone DEFAULT now(),
    expected_delivery_date date,
    actual_delivery_date date,
    status character varying DEFAULT 'pending'::character varying,
    subtotal numeric(10,2) DEFAULT '0'::numeric,
    tax_amount numeric(10,2) DEFAULT '0'::numeric,
    discount_amount numeric(10,2) DEFAULT '0'::numeric,
    total numeric(10,2) NOT NULL,
    payment_status character varying DEFAULT 'pending'::character varying,
    payment_method character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.purchase_orders OWNER TO neondb_owner;

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
    username character varying(50),
    password character varying(255),
    minimum_working_hours numeric(4,2) DEFAULT 8.00,
    daily_working_hours numeric(4,2) DEFAULT 8.00,
    blood_group character varying(5),
    staff_photo character varying(500),
    documents jsonb DEFAULT '[]'::jsonb,
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(20),
    emergency_contact_relation character varying(100),
    avatar character varying(500),
    date_of_birth date,
    gender character varying(10),
    nationality character varying(100),
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_movements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    store_id character varying NOT NULL,
    product_id character varying NOT NULL,
    movement_type character varying NOT NULL,
    quantity integer NOT NULL,
    previous_quantity integer NOT NULL,
    new_quantity integer NOT NULL,
    reference character varying,
    reference_type character varying,
    reason text,
    user_id character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.stock_movements OWNER TO neondb_owner;

--
-- Name: store_inventory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.store_inventory (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    store_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer DEFAULT 0,
    reserved_quantity integer DEFAULT 0,
    min_stock integer DEFAULT 0,
    max_stock integer DEFAULT 100,
    location character varying,
    last_restocked timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now()
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
    username character varying,
    password_hash character varying,
    role character varying DEFAULT 'staff'::character varying,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: account_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.account_categories (id, name, code, description, is_active, created_at) FROM stdin;
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
\.


--
-- Data for Name: chart_of_accounts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chart_of_accounts (id, account_number, account_name, category_id, parent_account_id, account_type, sub_type, normal_balance, is_active, description, created_at, updated_at) FROM stdin;
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
cust001	Rajesh	Kumar	rajesh@example.com	+91-98765-11111	\N	Mumbai, Maharashtra	\N	\N	\N	0	Bronze	\N	\N	2025-08-13 16:34:43.180506	2025-08-13 16:34:43.180506
cust002	Priya	Patel	priya@example.com	+91-98765-22222	\N	Mumbai, Maharashtra	\N	\N	\N	0	Bronze	\N	\N	2025-08-13 16:34:43.180506	2025-08-13 16:34:43.180506
cust003	Amit	Singh	amit@example.com	+91-98765-33333	\N	Mumbai, Maharashtra	\N	\N	\N	0	Bronze	\N	\N	2025-08-13 16:34:43.180506	2025-08-13 16:34:43.180506
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
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoice_items (id, invoice_id, product_id, product_name, description, quantity, unit_price, discount, total, created_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.invoices (id, invoice_number, customer_id, store_id, date, due_date, subtotal, tax_rate, tax_amount, discount_amount, total, status, payment_method, payment_date, applied_coupon_code, coupon_discount, coupon_type, coupon_description, notes, custom_fields, created_at, updated_at) FROM stdin;
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

COPY public.medical_invoices (id, invoice_number, patient_id, doctor_id, appointment_id, prescription_id, store_id, invoice_date, due_date, subtotal, tax_amount, discount_amount, total, payment_status, payment_method, payment_date, applied_coupon_code, coupon_discount, coupon_type, coupon_description, notes, qr_code, custom_fields, created_at, updated_at) FROM stdin;
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
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.patients (id, patient_code, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact, emergency_phone, blood_group, allergies, medical_history, insurance_provider, insurance_number, current_medications, previous_eye_conditions, last_eye_exam_date, current_prescription, risk_factors, family_medical_history, smoking_status, alcohol_consumption, exercise_frequency, right_eye_sphere, right_eye_cylinder, right_eye_axis, left_eye_sphere, left_eye_cylinder, left_eye_axis, pupillary_distance, doctor_notes, treatment_plan, follow_up_date, medical_alerts, username, password, national_id, nis_number, insurance_coupons, is_active, loyalty_tier, loyalty_points, custom_fields, created_at, updated_at) FROM stdin;
e879a730-9df1-4a8b-8c36-093e48250b24	PAT001	Rajesh	Kumar	1985-05-15	male	+91-98765-11111	rajesh@example.com	\N	Sunita Kumar	+91-98765-44444	\N	None known	Myopia, regular eye checkups	\N	\N	\N	\N	\N	\N	low	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	t	bronze	0	\N	2025-08-13 16:35:28.342645	2025-08-13 16:35:28.342645
d718db5b-f052-47ad-bab8-11aeb08f2efa	PAT002	Priya	Patel	1990-08-20	female	+91-98765-22222	priya@example.com	\N	Raj Patel	+91-98765-55555	\N	Dust allergy	Presbyopia, contact lens user	\N	\N	\N	\N	\N	\N	low	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	t	bronze	0	\N	2025-08-13 16:35:28.342645	2025-08-13 16:35:28.342645
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payment_transactions (id, transaction_number, transaction_type, source_type, source_id, customer_id, payer_id, payer_name, payer_type, amount, currency, payment_method, payment_processor, processor_transaction_id, bank_account, check_number, status, description, notes, fee_amount, net_amount, transaction_date, processed_date, reconciled_date, is_reconciled, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payroll; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payroll (id, payroll_number, staff_id, pay_period, pay_month, pay_year, pay_date, basic_salary, allowances, deductions, overtime, bonus, gross_salary, total_deductions, net_salary, working_days, present_days, absent_days, leaves_taken, status, processed_by, processed_date, payslip_generated, payslip_url, qr_code, created_at, updated_at) FROM stdin;
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
\.


--
-- Data for Name: product_costs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_costs (id, product_id, store_id, cost_type, unit_cost, quantity, total_cost, purchase_order_id, supplier_id, effective_date, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, name, description, sku, barcode, category_id, supplier_id, price, cost_price, product_type, reorder_level, is_active, custom_fields, created_at, updated_at) FROM stdin;
prod001	Ray-Ban Aviator Classic	Premium aviator style sunglasses with UV protection	RB-AV-001	\N	\N	\N	15000.00	8000.00	frames	5	t	\N	2025-08-13 16:35:10.564173	2025-08-13 16:35:10.564173
prod002	Progressive Lens - Premium	High-quality progressive lenses for presbyopia correction	PL-PRE-002	\N	\N	\N	8500.00	4000.00	lenses	10	t	\N	2025-08-13 16:35:10.564173	2025-08-13 16:35:10.564173
prod003	Contact Lens Solution	Multi-purpose contact lens cleaning solution	CLS-SOL-003	\N	\N	\N	350.00	200.00	accessories	20	t	\N	2025-08-13 16:35:10.564173	2025-08-13 16:35:10.564173
\.


--
-- Data for Name: profit_loss_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.profit_loss_entries (id, entry_date, entry_type, category, sub_category, source_type, source_id, description, amount, quantity, unit_amount, store_id, customer_id, product_id, staff_id, fiscal_year, fiscal_period, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.purchase_order_items (id, purchase_order_id, product_id, quantity, unit_cost, discount, total, received_quantity, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.purchase_orders (id, purchase_order_number, supplier_id, store_id, order_date, expected_delivery_date, actual_delivery_date, status, subtotal, tax_amount, discount_amount, total, payment_status, payment_method, notes, created_at, updated_at) FROM stdin;
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
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff (id, staff_code, employee_id, first_name, last_name, email, phone, address, "position", department, store_id, manager_id, hire_date, termination_date, status, role, permissions, username, password, minimum_working_hours, daily_working_hours, blood_group, staff_photo, documents, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, avatar, date_of_birth, gender, nationality, custom_fields, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff_profiles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff_profiles (id, user_id, staff_code, job_title, department, specialization, license_number, permissions, work_schedule, salary, hire_date, status, supervisor_id, emergency_contact, qualifications, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_movements (id, store_id, product_id, movement_type, quantity, previous_quantity, new_quantity, reference, reference_type, reason, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: store_inventory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.store_inventory (id, store_id, product_id, quantity, reserved_quantity, min_stock, max_stock, location, last_restocked, updated_at) FROM stdin;
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stores (id, name, address, city, state, zip_code, phone, email, manager_id, is_active, timezone, opening_hours, custom_fields, created_at, updated_at) FROM stdin;
store001	OptiStore Pro Main Branch	Medical Center, Healthcare District	Mumbai	Maharashtra	400001	+91-98765-43210	main@opt.vivaindia.com	\N	t	America/New_York	\N	\N	2025-08-13 16:34:11.633631	2025-08-13 16:34:11.633631
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.suppliers (id, name, contact_person, email, phone, address, created_at) FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_settings (id, category, key, value, is_encrypted, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, first_name, last_name, profile_image_url, username, password_hash, role, is_active, last_login, created_at, updated_at) FROM stdin;
user001	admin@opt.vivaindia.com	Admin	User	\N	\N	\N	admin	t	\N	2025-08-13 16:34:12.830362	2025-08-13 16:34:12.830362
user002	doctor@opt.vivaindia.com	Dr. Priya	Sharma	\N	\N	\N	doctor	t	\N	2025-08-13 16:34:12.830362	2025-08-13 16:34:12.830362
\.


--
-- Name: account_categories account_categories_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.account_categories
    ADD CONSTRAINT account_categories_code_unique UNIQUE (code);


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
-- Name: chart_of_accounts chart_of_accounts_account_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_account_number_unique UNIQUE (account_number);


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
-- Name: payment_transactions payment_transactions_transaction_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_transaction_number_unique UNIQUE (transaction_number);


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
-- Name: product_costs product_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_costs
    ADD CONSTRAINT product_costs_pkey PRIMARY KEY (id);


--
-- Name: products products_barcode_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_unique UNIQUE (barcode);


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
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_purchase_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_purchase_order_number_unique UNIQUE (purchase_order_number);


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
-- Name: staff staff_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_username_unique UNIQUE (username);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


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
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


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
-- Name: chart_of_accounts chart_of_accounts_category_id_account_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chart_of_accounts
    ADD CONSTRAINT chart_of_accounts_category_id_account_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.account_categories(id);


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
-- Name: general_ledger_entries general_ledger_entries_account_id_chart_of_accounts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.general_ledger_entries
    ADD CONSTRAINT general_ledger_entries_account_id_chart_of_accounts_id_fk FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id);


--
-- Name: general_ledger_entries general_ledger_entries_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.general_ledger_entries
    ADD CONSTRAINT general_ledger_entries_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


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
-- Name: payment_transactions payment_transactions_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: payment_transactions payment_transactions_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


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
-- Name: product_costs product_costs_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_costs
    ADD CONSTRAINT product_costs_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_costs product_costs_purchase_order_id_purchase_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_costs
    ADD CONSTRAINT product_costs_purchase_order_id_purchase_orders_id_fk FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- Name: product_costs product_costs_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_costs
    ADD CONSTRAINT product_costs_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: product_costs product_costs_supplier_id_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_costs
    ADD CONSTRAINT product_costs_supplier_id_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


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
-- Name: profit_loss_entries profit_loss_entries_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: profit_loss_entries profit_loss_entries_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: profit_loss_entries profit_loss_entries_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: profit_loss_entries profit_loss_entries_staff_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_staff_id_users_id_fk FOREIGN KEY (staff_id) REFERENCES public.users(id);


--
-- Name: profit_loss_entries profit_loss_entries_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.profit_loss_entries
    ADD CONSTRAINT profit_loss_entries_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: purchase_order_items purchase_order_items_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_purchase_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_purchase_orders_id_fk FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id);


--
-- Name: purchase_orders purchase_orders_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: purchase_orders purchase_orders_supplier_id_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


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
-- Name: stock_movements stock_movements_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_movements stock_movements_store_id_stores_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_store_id_stores_id_fk FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: stock_movements stock_movements_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


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
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

