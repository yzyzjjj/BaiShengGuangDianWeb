const_loginurl = "/Account/Login";
const_indexurl = "/Home";
var hubConnection = null;

var maxProcessData = 8;
var lastLocation = "lastLocation";
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

var fileEnum = {
    Default: 0,
    // �̼�
    FirmwareLibrary: 1,
    // Ӧ�ò�
    ApplicationLibrary: 2
}

//�ļ���չ��
var fileExt = [];
fileExt[fileEnum.Default] = [];
// �̼�
fileExt[fileEnum.FirmwareLibrary] = ["bin"];
// Ӧ�ò�
fileExt[fileEnum.ApplicationLibrary] = [];

//�ļ��ϴ��ص�
var fileCallBack = [];
fileCallBack[fileEnum.Default] = function () { };
// �̼�
fileCallBack[fileEnum.FirmwareLibrary] = function () { };
// Ӧ�ò�
fileCallBack[fileEnum.ApplicationLibrary] = function () { };