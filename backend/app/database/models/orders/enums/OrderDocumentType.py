import enum


class OrderDocumentType(str, enum.Enum):
    CMR = "CMR"
    Packing_list = "Packing list"
    Export_documents = "Export documents"
    Other = "Other"
    Moving_report = "Moving report"
    Excel_list_for_plukk = "Excel list for plukk"
    Invoice = "Invoice"
    Loading_chart = "Loading chart"
    Off_loading_chart = "Off loading chart"
    Bill_og_loading = "Bill og loading"
    SAD = "SAD"
    T1 = "T1"
    MIO = "MIO"
    Deviation_report = "Deviation report"
    Label = "Label"
    Pictures = "Pictures"
    Company_plukk_list = "owner plukk list"
    Plukk_list_scanned = "Plukk list scanned"
    ThreePL_FourPL = "3PL/4PL"


