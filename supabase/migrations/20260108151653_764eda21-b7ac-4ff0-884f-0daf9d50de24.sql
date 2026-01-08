-- Create enum for campaign status
CREATE TYPE public.status_campanha AS ENUM ('ativa', 'pausada', 'concluida');

-- Create enum for upload status
CREATE TYPE public.status_upload AS ENUM ('sucesso', 'erro', 'parcial');

-- Create campanhas table
CREATE TABLE public.campanhas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_campanha TEXT NOT NULL,
    status status_campanha NOT NULL DEFAULT 'ativa',
    data_inicio DATE NOT NULL,
    data_fim DATE,
    gasto_total DECIMAL(10,2) DEFAULT 0,
    leads_gerados INTEGER DEFAULT 0,
    conversoes INTEGER DEFAULT 0,
    receita_gerada DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create configuracoes table
CREATE TABLE public.configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meta_mensal DECIMAL(10,2) DEFAULT 50000,
    alerta_cpl DECIMAL(10,2) DEFAULT 50,
    budget_total DECIMAL(10,2) DEFAULT 100000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create historico_uploads table
CREATE TABLE public.historico_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_arquivo TEXT NOT NULL,
    total_registros INTEGER DEFAULT 0,
    data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status status_upload NOT NULL DEFAULT 'sucesso',
    detalhes_erro TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_uploads ENABLE ROW LEVEL SECURITY;

-- Create public read/write policies (dashboard is public for this use case)
CREATE POLICY "Allow public read access on campanhas"
ON public.campanhas FOR SELECT
USING (true);

CREATE POLICY "Allow public insert on campanhas"
ON public.campanhas FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update on campanhas"
ON public.campanhas FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete on campanhas"
ON public.campanhas FOR DELETE
USING (true);

CREATE POLICY "Allow public read access on configuracoes"
ON public.configuracoes FOR SELECT
USING (true);

CREATE POLICY "Allow public insert on configuracoes"
ON public.configuracoes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update on configuracoes"
ON public.configuracoes FOR UPDATE
USING (true);

CREATE POLICY "Allow public read access on historico_uploads"
ON public.historico_uploads FOR SELECT
USING (true);

CREATE POLICY "Allow public insert on historico_uploads"
ON public.historico_uploads FOR INSERT
WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_campanhas_updated_at
    BEFORE UPDATE ON public.campanhas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON public.configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration
INSERT INTO public.configuracoes (meta_mensal, alerta_cpl, budget_total)
VALUES (50000, 50, 100000);