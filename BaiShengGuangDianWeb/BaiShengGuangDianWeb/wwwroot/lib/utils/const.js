const_loginurl = "/Account/Login";
const_indexurl = "/Home";
var hubConnection = null;

var tdShowLength = 20;
var oLanguage = {
    "sLengthMenu": "ÿҳ��ʾ _MENU_ ����¼",
    "sZeroRecords": "�Բ��𣬲�ѯ�����κ��������",
    "sInfo": "��ǰ��ʾ _START_ �� _END_ ������ _TOTAL_����¼",
    "sInfoEmtpy": "�Ҳ����������",
    "sInfoFiltered": "���ݱ��й�Ϊ _MAX_ ����¼)",
    "sProcessing": "���ڼ�����...",
    "sSearch": "����",
    "oPaginate": {
        "sFirst": "��һҳ",
        "sPrevious": " ��һҳ ",
        "sNext": " ��һҳ ",
        "sLast": " ���һҳ "
    }
}

var chatEnum = {
    Default: 0,
    //����
    Connect: 1,
    // �����豸
    FaultDevice: 2
}

var maxProcessData = 8;
var lastLocation = "lastLocation";