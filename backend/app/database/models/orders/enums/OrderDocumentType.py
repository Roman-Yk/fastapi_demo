import enum


class OrderDocumentType(str, enum.Enum):
    T1 = "T1"
    MIO = "MIO"
    SAD = "SAD"
    CMR = "CMR"
    Label = "Label"
    Other = "Other"
    Invoice = "Invoice"
    Pictures = "Pictures"
    Packing_list = "Packing list"
    Moving_report = "Moving report"
    Loading_chart = "Loading chart"
    ThreePL_FourPL = "3PL/4PL"
    Bill_og_loading = "Bill og loading"
    Deviation_report = "Deviation report"
    Export_documents = "Export documents"
    Off_loading_chart = "Off loading chart"
    Company_plukk_list = "owner plukk list"
    Plukk_list_scanned = "Plukk list scanned"
    Excel_list_for_plukk = "Excel list for plukk"


